/*
  The privacy policy and the terms, as the site ships them. Both are edited in
  the admin under "Privacy & terms".

  Written from what the code actually does, so they stay true only while it
  does: the contact form, the review form and the newsletter are the only
  places personal data comes in; it is stored in MongoDB Atlas, files and
  photos in Cloudinary, notifications go out through Gmail, the site is hosted
  on Vercel; the IP address is kept with enquiries and reviews against spam;
  the only cookie is the admin's sign-in, and the theme choice is kept in the
  browser. Change any of that and these need changing too.

  The body format is the About story's, plus lists: a blank line starts a
  paragraph, "## " a heading, and lines starting "- " are a list. "{email}"
  becomes the site's email address, so the two cannot drift.

  A draft from the facts, not legal advice: it should be read by a lawyer.
*/

export const privacy = {
  title: "Privacy policy",
  updated: "25 October 2026",
  summary: [
    "We only collect what you type into our forms, plus the technical details needed to keep them free of spam.",
    "We use it to reply to you, to publish reviews you send us, and to send the newsletter you signed up for.",
    "We don't sell it, and we don't use advertising or tracking cookies.",
    "You can ask to see, correct or delete your data at any time by emailing {email}.",
  ].join("\n"),
  body: `## Who we are

Docerity is a software studio based in Lagos, Nigeria. In this policy, "we" and "us" mean Docerity. For anything about this policy or your data, email {email}.

## What we collect

We only collect what you choose to send us through this site.

When you use the contact form:
- your name and email address
- your company, role, budget and timeline, if you choose to give them
- your message, and any files you attach
- for mentorship applications, the starting point you pick and a link to your code, if you give one

When you leave a review:
- your name, your title and your review, with its rating
- a photo and links to your work, if you add them
- your email address, if you give it, so we can contact you about the review. It is never published.

When you join the newsletter:
- your email address

With every form you send, we also record the IP address it came from, so we can block spam and abuse.

## How we use it

- To reply to your enquiry, and to do the work that follows if we work together
- To publish your review once we have read it, with your name, title, photo and links as you gave them
- To send you the newsletter. Every email has a link to unsubscribe.
- To keep the forms free of spam and abuse

We don't sell your data or share it for advertising, and we don't make automated decisions about you.

## Who we share it with

Only the companies that run this site for us, and only so they can do that:
- Vercel hosts the website
- MongoDB Atlas stores form entries, reviews and newsletter sign-ups
- Cloudinary stores the files you attach and review photos. Attachments are private and can only be opened through links that expire.
- Google (Gmail) delivers the email that tells us a form has been sent

We will also share data if the law requires us to.

## Cookies

We don't use advertising or analytics cookies. The site remembers whether you chose the light or dark theme, in your own browser. The only cookie we set is for staff signing in to manage the site.

## How long we keep it

- Enquiries: for as long as we need to reply and to do any work that follows
- Reviews: for as long as they are published, or until you ask us to remove one
- Newsletter: until you unsubscribe. We keep a note that you unsubscribed, so we don't email you again.

You can ask us to delete your data sooner at any time.

## Your rights

Under the Nigeria Data Protection Act 2023, and the GDPR if you are in the UK or the EU, you can ask us to:
- give you a copy of the data we hold about you
- correct it
- delete it
- stop using it, or stop using it for a particular purpose

Email {email} and we will reply within a month. You can also complain to the Nigeria Data Protection Commission, or to the data protection authority where you live.

## Data stored outside Nigeria

The companies above may store data outside Nigeria, including in the United States and the European Union. We use providers that protect it to the standards these laws require.

## Children

This site is not meant for children. We don't knowingly collect data from anyone under 18 without a parent's or guardian's consent.

## Changes to this policy

If we change this policy, we will update this page and the date at the top.`,
};

export const terms = {
  title: "Terms of use",
  updated: "25 October 2026",
  summary: [
    "This site tells you about Docerity and its work. Using it means you accept these terms.",
    "Work we do for clients is covered by a separate written contract, not by these terms.",
    "You're welcome to link to our explainers and quote short parts with credit.",
    "Please use the forms honestly, and only send things you have the right to share.",
  ].join("\n"),
  body: `## Who we are

This website is run by Docerity, a software studio based in Lagos, Nigeria. You can reach us at {email}.

## Using this site

You may use this site to learn about us, read our explainers, and get in touch. Please don't:
- send spam, or use the forms to sell something
- try to break, overload or get around the security of the site
- copy the site's content in bulk, by hand or with automated tools

## Our content

The writing, explainers, designs and code examples on this site belong to Docerity, unless we say otherwise. You may link to any page, and quote short parts with credit and a link back. Please don't republish whole articles or explainers without asking us first.

## What you send us

When you send us a message, a file or a review, you confirm it is yours to share and that it is accurate. When you send a review, you allow us to publish it on this site with the name, title, photo and links you gave. We read every review before it appears, and we may decline one or remove it later.

## Working with us

Nothing on this site is an offer or a contract. The ways of working described on the How we work page are a summary. When we work together, the scope, price, ownership of the work and everything else are agreed in a separate written contract, and that contract is what applies.

## Explainers are for learning

Our explainers and articles simplify things on purpose, to make them easier to understand. They are not professional advice for your particular situation. If you rely on them for a decision, check the details first.

## Links to other sites

We link to other sites, such as projects we built or tools we use. We don't control them and aren't responsible for what they contain.

## No guarantees

We work to keep this site accurate and available, but we provide it as it is, without guarantees that it will always be available, complete or error-free. As far as the law allows, we aren't liable for any loss that comes from using it.

## The law that applies

These terms are governed by the laws of the Federal Republic of Nigeria.

## Changes to these terms

If we change these terms, we will update this page and the date at the top.`,
};
