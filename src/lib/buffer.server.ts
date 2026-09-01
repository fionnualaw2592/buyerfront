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
