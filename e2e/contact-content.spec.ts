import { test, expect } from "@playwright/test";

import { normaliseLink, projectTypes, validateEnquiry, type EnquiryInput } from "@/lib/contact/schema";
import { fieldsFor, formCopyFrom, FORM_COPY, HEADING_KEYS, progressOf } from "@/components/sections/contact/contact-content";
import { DEFAULTS } from "@/lib/content/blocks/defaults";

/*
  Unit tests for the contact form's rules. Like home-content.spec.ts these
  never open a page.
*/
const base: EnquiryInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "",
  role: "",
  projectType: "mentorship",
  budget: "",
  timeline: "",
  message: "I want to get to a backend role within the year.",
};

test.describe("the form's words", () => {
  test("every kind of enquiry has its copy and a heading in the defaults", () => {
    const headings = DEFAULTS.contact.headings as Record<string, unknown>;
    for (const { value } of projectTypes) {
      expect(FORM_COPY[value].submit).not.toBe("");
      expect(headings[HEADING_KEYS[value]]).toBeTruthy();
    }
  });

  test("a mentee is not asked a client's questions, and the other way round", () => {
    expect(fieldsFor("mentorship")).toMatchObject({ budget: false, company: false, role: false, stage: true, codeLink: true });
    expect(fieldsFor("software")).toMatchObject({ budget: true, company: true, role: true, stage: false, codeLink: false });
    expect(fieldsFor("other")).toMatchObject({ timeline: false, files: false });
  });
});

test.describe("formCopyFrom", () => {
  test("the defaults give back the built-in wording", () => {
    const forms = DEFAULTS.contact.forms as Parameters<typeof formCopyFrom>[0];
    expect(formCopyFrom(forms)).toEqual(FORM_COPY);
    expect(formCopyFrom(undefined)).toEqual(FORM_COPY);
  });

  test("an edited word replaces the built-in one; the icon and link target stay", () => {
    const copy = formCopyFrom({ software: { submit: "Send it", nextLabel: "Our work" } });
    expect(copy.software.submit).toBe("Send it");
    expect(copy.software.next).toEqual({ href: FORM_COPY.software.next.href, label: "Our work" });
    expect(copy.software.icon).toBe(FORM_COPY.software.icon);
    expect(copy.mentorship).toEqual(FORM_COPY.mentorship);
  });

  test("a required word left blank falls back, but blanking an optional label removes its field", () => {
    const copy = formCopyFrom({ software: { submit: "  ", filesLabel: "", timelineLabel: "" } });
    expect(copy.software.submit).toBe(FORM_COPY.software.submit);
    expect(fieldsFor("software", copy.software)).toMatchObject({ files: false, timeline: false });
  });
});

test.describe("progressOf", () => {
  test("counts the kind, then about you, then the message", () => {
    expect(progressOf({ name: "", email: "", message: "" })).toBe(1);
    expect(progressOf({ name: "Ada", email: "ada@example.com", message: "" })).toBe(2);
    expect(progressOf({ name: "Ada", email: "ada@example.com", message: "x".repeat(20) })).toBe(3);
  });
});

test.describe("the code link", () => {
  test("accepts links written with or without a scheme", () => {
    for (const codeLink of ["github.com/ada", "https://gitlab.com/ada/project", "ada.dev"]) {
      expect(validateEnquiry({ ...base, codeLink }, []).codeLink).toBeUndefined();
    }
  });

  test("refuses something that is not a link", () => {
    expect(validateEnquiry({ ...base, codeLink: "my repo" }, []).codeLink).toBeTruthy();
    expect(validateEnquiry({ ...base, codeLink: `github.com/${"a".repeat(300)}` }, []).codeLink).toBeTruthy();
  });

  test("is optional", () => {
    expect(validateEnquiry({ ...base, codeLink: "" }, [])).toEqual({});
    expect(validateEnquiry(base, [])).toEqual({});
  });

  test("is stored with a scheme", () => {
    expect(normaliseLink("github.com/ada")).toBe("https://github.com/ada");
    expect(normaliseLink("http://ada.dev")).toBe("http://ada.dev");
    expect(normaliseLink("  ")).toBe("");
  });
});
