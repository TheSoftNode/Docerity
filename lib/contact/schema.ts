/**
 * One source of truth for the enquiry form, shared by the client and the
 * route handler so the two can never disagree about what is valid.
 */

export const projectTypes = [
  { value: "software", label: "Software project" },
  { value: "mentorship", label: "Mentorship" },
  { value: "speaking", label: "Speaking / workshop" },
  { value: "other", label: "Something else" },
] as const;

export type ProjectType = (typeof projectTypes)[number]["value"];

export const budgets = [
  { value: "", label: "Prefer not to say" },
  { value: "under-10k", label: "Under $10k" },
  { value: "10-25k", label: "$10k – $25k" },
  { value: "25-50k", label: "$25k – $50k" },
  { value: "50-100k", label: "$50k – $100k" },
  { value: "100k-plus", label: "$100k+" },
  { value: "retainer", label: "Ongoing retainer" },
] as const;

export const timelines = [
  { value: "", label: "Not sure yet" },
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "In 1 – 3 months" },
  { value: "3-6-months", label: "In 3 – 6 months" },
  { value: "exploring", label: "Just exploring" },
] as const;

export const roles = [
  { value: "", label: "Select one" },
  { value: "founder", label: "Founder / CEO" },
  { value: "engineering", label: "Engineering lead / CTO" },
  { value: "product", label: "Product" },
  { value: "operations", label: "Operations" },
  { value: "engineer", label: "Engineer" },
  { value: "other", label: "Other" },
] as const;

/*
  A route handler on Vercel receives the whole request body in memory, and
  serverless functions cap that at 4.5MB. Anything larger has to go straight
  from the browser to object storage — see the note in the route handler — so
  the limits here stay comfortably under that ceiling.
*/
export const FILE_LIMITS = {
  maxFiles: 5,
  maxBytesPerFile: 4 * 1024 * 1024,
  maxBytesTotal: 4 * 1024 * 1024,
} as const;

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
] as const;

/** Extensions for the file picker; the server checks the type, not this. */
export const ACCEPTED_FILE_EXTENSIONS =
  ".pdf,.doc,.docx,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.zip";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type FieldErrors = Partial<
  Record<"name" | "email" | "company" | "message" | "files" | "form", string>
>;

export type EnquiryInput = {
  name: string;
  email: string;
  company: string;
  role: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
};

/* Deliberately permissive: the shape catches typos, delivery proves the rest. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(
  input: EnquiryInput,
  files: { name: string; size: number; type: string }[]
): FieldErrors {
  const errors: FieldErrors = {};

  if (input.name.trim().length < 2) {
    errors.name = "Please tell me your name.";
  }
  if (!EMAIL.test(input.email.trim())) {
    errors.email = "That email address doesn't look right.";
  }
  if (input.message.trim().length < 20) {
    errors.message = "A sentence or two about the project helps me reply properly.";
  }
  if (!projectTypes.some((type) => type.value === input.projectType)) {
    errors.form = "Please choose what this is about.";
  }

  if (files.length > FILE_LIMITS.maxFiles) {
    errors.files = `Up to ${FILE_LIMITS.maxFiles} files, please.`;
  } else {
    const oversized = files.find((f) => f.size > FILE_LIMITS.maxBytesPerFile);
    const total = files.reduce((sum, f) => sum + f.size, 0);
    const wrongType = files.find(
      (f) => f.type && !ACCEPTED_FILE_TYPES.includes(f.type as (typeof ACCEPTED_FILE_TYPES)[number])
    );

    if (oversized) {
      errors.files = `${oversized.name} is ${formatBytes(oversized.size)} — the limit is ${formatBytes(FILE_LIMITS.maxBytesPerFile)} per file.`;
    } else if (total > FILE_LIMITS.maxBytesTotal) {
      errors.files = `That's ${formatBytes(total)} in total — the limit is ${formatBytes(FILE_LIMITS.maxBytesTotal)}.`;
    } else if (wrongType) {
      errors.files = `${wrongType.name} isn't a supported file type.`;
    }
  }

  return errors;
}
