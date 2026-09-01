// Server-only Buffer API client. Never import this from client code.
// BUFFER_API_KEY is read inside functions (per-request env injection) and is
// never returned, logged or included in error messages.

const BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com/";

export class BufferApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "BufferApiError";
    this.status = status;
  }
}

type GraphqlResponse<T> = {
  data?: T | null;
  errors?: Array<{ message?: string; extensions?: { code?: string } }>;
};

async function bufferGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = process.env["BUFFER_API_KEY"];
  if (!token) {
    throw new BufferApiError("Buffer is not configured", 500);
  }

  let response: Response;
  try {
    response = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    // Swallow the underlying error: request details include the auth header.
    throw new BufferApiError("Could not reach the Buffer API");
  }

  if (!response.ok) {
    const status = response.status;
    if (status === 401 || status === 403) {
      throw new BufferApiError("Buffer rejected the configured credentials", 502);
    }
    if (status === 429) {
      throw new BufferApiError("Buffer rate limit reached, try again shortly", 429);
    }
    throw new BufferApiError(`Buffer API returned status ${status}`);
  }

  let payload: GraphqlResponse<T>;
  try {
    payload = (await response.json()) as GraphqlResponse<T>;
  } catch {
    throw new BufferApiError("Buffer API returned an unreadable response");
  }

  if (payload.errors?.length) {
    const codes = payload.errors
      .map((e) => e.extensions?.code ?? e.message ?? "UNKNOWN")
      .join(", ");
    throw new BufferApiError(`Buffer API error: ${codes}`);
  }

  if (!payload.data) {
    throw new BufferApiError("Buffer API returned no data");
  }

  return payload.data;
}

export type BufferChannel = {
  id: string;
  name: string;
  service: string;
  serviceId: string | null;
};

export type BufferConnectionReport = {
  account: { id: string; organizations: Array<{ id: string; name: string }> };
  channels: BufferChannel[];
  matched: {
    linkedin: BufferChannel | null;
    tiktok: BufferChannel | null;
  };
};

/**
 * Read-only connection test: resolves the Buffer account, its organizations
 * and every connected channel, then picks out the Buyerfront LinkedIn page and
 * TikTok account. Performs no mutations.
 */
export async function getBufferConnectionReport(): Promise<BufferConnectionReport> {
  const accountData = await bufferGraphql<{
    account: { id: string; organizations: Array<{ id: string; name: string }> } | null;
  }>("query { account { id organizations { id name } } }");

  const account = accountData.account;
  if (!account) {
    throw new BufferApiError("Buffer returned no account for these credentials");
  }

  const channels: BufferChannel[] = [];
  for (const org of account.organizations ?? []) {
    const data = await bufferGraphql<{ channels: BufferChannel[] | null }>(
      "query($input: ChannelsInput!) { channels(input: $input) { id name service serviceId } }",
      { input: { organizationId: org.id } },
    );
    channels.push(...(data.channels ?? []));
  }

  const isBuyerfront = (channel: BufferChannel) =>
    channel.name.toLowerCase().replace(/\s+/g, "").includes("buyerfront");

  const pick = (service: string) =>
    channels.find((c) => c.service === service && isBuyerfront(c)) ??
    channels.find((c) => c.service === service) ??
    null;

  return {
    account: { id: account.id, organizations: account.organizations ?? [] },
    channels,
    matched: { linkedin: pick("linkedin"), tiktok: pick("tiktok") },
  };
}

// ---------------------------------------------------------------------------
// Phase 2: write operations (create / schedule) and status + metrics reads.
// All mutations are opt-in: callers must pass an already-approved row.
// ---------------------------------------------------------------------------

export const BUYERFRONT_CHANNELS = {
  linkedin: "6a974db0065799be466d2901",
  tiktok: "6a974dd1065799be466d2dca",
} as const;

export type BufferPostResult = {
  postId: string;
  status: string | null;
  dueAt: string | null;
};

const POST_CREATE_MUTATION = `
mutation($input: PostCreateInput!) {
  postCreate(input: $input) {
    ... on PostCreateSuccess { post { id status dueAt } }
    ... on PostCreateError { message }
  }
}`;

type PostCreatePayload = {
  postCreate?:
    | { post?: { id: string; status?: string | null; dueAt?: string | null } | null; message?: string }
    | null;
};

/**
 * Creates a post in Buffer. When `scheduledFor` is omitted the post is added to
 * the channel queue; when provided the post is scheduled for that exact time.
 * `notification_publish` sends the post as a reminder so the operator can add
 * native TikTok sounds before posting from the TikTok app.
 */
export async function createBufferPost(params: {
  channelId: string;
  text: string;
  assetUrl?: string | null;
  scheduledFor?: string | null;
  notifyOnly?: boolean;
}): Promise<BufferPostResult> {
  if (!Object.values(BUYERFRONT_CHANNELS).includes(params.channelId as never)) {
    throw new BufferApiError("Refusing to post to an unknown channel", 400);
  }
  if (!params.text.trim()) {
    throw new BufferApiError("Refusing to post empty content", 400);
  }
  if (params.scheduledFor) {
    const due = Date.parse(params.scheduledFor);
    if (Number.isNaN(due)) throw new BufferApiError("Invalid scheduled time", 400);
    if (due <= Date.now()) throw new BufferApiError("Scheduled time must be in the future", 400);
  }

  const input: Record<string, unknown> = {
    channelId: params.channelId,
    text: params.text,
    ...(params.assetUrl ? { media: [{ url: params.assetUrl }] } : {}),
    ...(params.scheduledFor
      ? { dueAt: new Date(params.scheduledFor).toISOString(), schedulingType: "custom" }
      : { schedulingType: "queue" }),
    ...(params.notifyOnly ? { notificationOnly: true } : {}),
  };

  const data = await bufferGraphql<PostCreatePayload>(POST_CREATE_MUTATION, { input });
  const post = data.postCreate?.post;
  if (!post?.id) {
    throw new BufferApiError(data.postCreate?.message ?? "Buffer did not return a post");
  }
  return { postId: post.id, status: post.status ?? null, dueAt: post.dueAt ?? null };
}

export type BufferPostStatus = {
  postId: string;
  status: string | null;
  dueAt: string | null;
  sentAt: string | null;
  metrics: {
    views: number | null;
    impressions: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    clicks: number | null;
  };
};

const POST_QUERY = `
query($id: String!) {
  post(id: $id) {
    id
    status
    dueAt
    sentAt
    metrics { key value }
  }
}`;

/** Reads a post's current Buffer status plus whatever metrics Buffer exposes. */
export async function getBufferPostStatus(postId: string): Promise<BufferPostStatus> {
  if (!postId) throw new BufferApiError("Missing Buffer post id", 400);

  const data = await bufferGraphql<{
    post:
      | {
          id: string;
          status?: string | null;
          dueAt?: string | null;
          sentAt?: string | null;
          metrics?: Array<{ key: string; value: number | string | null }> | null;
        }
      | null;
  }>(POST_QUERY, { id: postId });

  const post = data.post;
  if (!post) throw new BufferApiError("Buffer post not found", 404);

  const read = (...keys: string[]) => {
    for (const entry of post.metrics ?? []) {
      if (keys.includes(entry.key.toLowerCase())) {
        const n = Number(entry.value);
        if (Number.isFinite(n)) return n;
      }
    }
    return null;
  };

  return {
    postId: post.id,
    status: post.status ?? null,
    dueAt: post.dueAt ?? null,
    sentAt: post.sentAt ?? null,
    metrics: {
      views: read("views", "video_views"),
      impressions: read("impressions", "reach"),
      likes: read("likes", "reactions", "favorites"),
      comments: read("comments"),
      shares: read("shares", "reposts", "retweets"),
      clicks: read("clicks", "url_clicks"),
    },
  };
}
