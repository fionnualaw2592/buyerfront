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

export interface RevenueLeakageRequestProps {
  name?: string;
  email?: string;
  company?: string;
  website?: string;
  sells?: string;
  enquiryProcess?: string;
  stuckPoints?: string;
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

export function RevenueLeakageRequestEmail({
  name = "Not provided",
  email = "Not provided",
  company = "Not provided",
  website = "Not provided",
  sells = "Not provided",
  enquiryProcess = "Not provided",
  stuckPoints = "Not provided",
  submittedAt = "",
}: RevenueLeakageRequestProps) {
  return (
    <Html>
      <Head />
      <Preview>{`New Onboarding Leak Check request from ${company}`}</Preview>
      <Body
        style={{ backgroundColor: "#ffffff", margin: 0, fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 24px" }}>
          <Section style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "10px" }}>
            <Heading style={{ fontSize: "19px", margin: "0 0 4px", color: "#111111" }}>
              New Onboarding Leak Check request
            </Heading>
            <Text style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px" }}>
              Submitted via buyerfront.ie{submittedAt ? ` on ${submittedAt}` : ""}
            </Text>
            <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 20px" }} />
            <Row label="Name" value={name} />
            <Row label="Email" value={email} />
            <Row label="Company" value={company} />
            <Row label="Website" value={website} />
            <Row label="What they sell" value={sells} />
            <Row label="After a client says yes" value={enquiryProcess} />
            <Row label="Where onboarding gets stuck" value={stuckPoints} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: RevenueLeakageRequestEmail,
  displayName: "Onboarding Leak Check request (internal notification)",
  subject: (data: Record<string, unknown>) =>
    `Onboarding Leak Check: ${(data["company"] as string) || "New enquiry"}`,
  to: "hello@buyerfront.ie",
  previewData: {
    name: "Aoife Byrne",
    email: "aoife@example.com",
    company: "Example Ltd",
    website: "example.com",
    sells: "Commercial fit-out projects",
    enquiryProcess:
      "The account manager introduces delivery and requests the client's assets.",
    stuckPoints: "Assets are missing before kickoff",
    submittedAt: "17 September 2026, 09:20 UTC",
  },
} satisfies TemplateEntry;
