import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

import type { TemplateEntry } from "./registry";

export interface SnapshotRequestProps {
  name?: string;
  email?: string;
  company?: string;
  website?: string;
  sells?: string;
  competitor?: string;
  submittedAt?: string;
}

const row: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "15px",
  lineHeight: "1.5",
  color: "#1a1a1a",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6b7280",
  marginBottom: "2px",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={row}>
      <span style={labelStyle}>{label}</span>
      <span>{value}</span>
    </Text>
  );
}

export function SnapshotRequestEmail({
  name = "Not provided",
  email = "Not provided",
  company = "Not provided",
  website = "Not provided",
  sells = "Not provided",
  competitor = "Not provided",
  submittedAt = "",
}: SnapshotRequestProps) {
  return (
    <Html>
      <Head />
      <Preview>{`New Snapshot request from ${company}`}</Preview>
      <Body style={{ backgroundColor: "#f6f6f4", margin: 0, fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 24px" }}>
          <Section style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "10px" }}>
            <Heading style={{ fontSize: "19px", margin: "0 0 4px", color: "#111111" }}>
              New AI Visibility Snapshot request
            </Heading>
            <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px" }}>
              Submitted via buyerfront.ie{submittedAt ? ` on ${submittedAt}` : ""}
            </Text>
            <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 20px" }} />
            <Row label="Name" value={name} />
            <Row label="Work email" value={email} />
            <Row label="Company" value={company} />
            <Row label="Website" value={website} />
            <Row label="What they sell" value={sells} />
            <Row label="Main competitors" value={competitor} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: SnapshotRequestEmail,
  displayName: "Snapshot request (internal notification)",
  subject: (data: Record<string, unknown>) =>
    `Snapshot request: ${(data["company"] as string) || "New enquiry"}`,
  to: "hello@buyerfront.ie",
  previewData: {
    name: "Aoife Byrne",
    email: "aoife@example.com",
    company: "Example Ltd",
    website: "example.com",
    sells: "CRM software for field sales teams",
    competitor: "HubSpot, Pipedrive",
    submittedAt: "1 September 2026, 16:20 UTC",
  },
} satisfies TemplateEntry;
