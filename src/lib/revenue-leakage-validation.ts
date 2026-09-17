export type RevenueLeakageFields = {
  name: string;
  email: string;
  company: string;
  website: string;
  sells: string;
  enquiryProcess: string;
  stuckPoints: string;
};

export type RevenueLeakageErrors = Partial<Record<keyof RevenueLeakageFields, string>>;

export const emptyRevenueLeakageFields: RevenueLeakageFields = {
  name: "",
  email: "",
  company: "",
  website: "",
  sells: "",
  enquiryProcess: "",
  stuckPoints: "",
};

// Personal email domains are allowed on purpose: only format is checked.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DOMAIN_PATTERN = /^([a-z]+:\/\/)?[^\s.]+\.[^\s]{2,}$/i;

export function validateRevenueLeakage(values: RevenueLeakageFields): RevenueLeakageErrors {
  const errors: RevenueLeakageErrors = {};

  if (!values.name.trim()) errors.name = "Please add your name.";

  const email = values.email.trim();
  if (!email) errors.email = "Please add your email.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "That email doesn't look valid.";

  if (!values.company.trim()) errors.company = "Please add your company name.";

  const website = values.website.trim();
  if (!website) errors.website = "Please add your website.";
  else if (!DOMAIN_PATTERN.test(website)) errors.website = "Enter a valid domain.";

  if (values.sells.trim().length < 3) {
    errors.sells = "A short description helps us read your buying journey.";
  }

  if (values.enquiryProcess.trim().length < 10) {
    errors.enquiryProcess = "Tell us briefly what happens after an enquiry arrives.";
  }

  return errors;
}
