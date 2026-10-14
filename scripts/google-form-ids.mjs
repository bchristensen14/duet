#!/usr/bin/env node
// Reads a public Google Form and prints the .env lines the waitlist needs.
// Usage: npm run waitlist:ids -- "https://docs.google.com/forms/d/e/<ID>/viewform"  (forms.gle links work too)

const url = process.argv[2]
if (!url) {
  console.error('Usage: npm run waitlist:ids -- "<Google Form link>"')
  process.exit(1)
}

const res = await fetch(url, { redirect: 'follow' })
const finalUrl = res.url
if (/accounts\.google\.com/.test(finalUrl)) {
  fail('The form asks visitors to sign in. In the form settings, turn off "Restrict to users in…" and "Limit to 1 response".')
}
const formId = finalUrl.match(/\/forms\/d\/e\/([^/]+)\//)?.[1]
if (!formId) fail(`That doesn't look like a form's public link (got ${finalUrl}). Use Send → link in Google Forms.`)

const html = await res.text()
if (/closedform/.test(finalUrl) || /no longer accepting responses/i.test(html)) {
  fail('The form is not accepting responses. Turn on "Accepting responses" (and publish it).')
}

const raw = html.match(/FB_PUBLIC_LOAD_DATA_ = (\[[\s\S]*?\])\s*;\s*<\/script>/)?.[1]
if (!raw) fail('Could not read the form questions. Is the link public?')
const data = JSON.parse(raw)
const questions = (data[1]?.[1] ?? [])
  .filter((q) => Array.isArray(q?.[4]))
  .map((q) => ({ title: String(q[1] ?? ''), entry: `entry.${q[4][0][0]}`, required: q[4][0][2] === 1 }))

// Google rejects submissions without its own email field when this is on, and the page can't see the rejection.
if (/name="emailAddress"/.test(html)) {
  fail('"Collect email addresses" is on. Set it to "Do not collect" in Settings → Responses; the page sends the email as a normal question.')
}

const find = (re) => questions.find((q) => re.test(q.title))
const email = find(/e-?mail/i)
const feedback = find(/feedback|feature|anything|wish|want/i)

console.log('Questions found:')
for (const q of questions) console.log(`  ${q.entry}  ${q.title}${q.required ? ' (required)' : ''}`)
if (!email) fail('\nNo question with "Email" in its title. Add a short-answer question called "Email".')
const extraRequired = questions.filter((q) => q.required && q !== email)
if (extraRequired.length) {
  fail(`\nMake these questions optional, or signups without them are rejected: ${extraRequired.map((q) => q.title).join(', ')}`)
}

console.log('\nPut these lines in .env:\n')
console.log(`VITE_WAITLIST_FORM_ID=${formId}`)
console.log(`VITE_WAITLIST_EMAIL_ENTRY=${email.entry}`)
console.log(`VITE_WAITLIST_FEEDBACK_ENTRY=${feedback?.entry ?? ''}`)

function fail(msg) {
  console.error(msg)
  process.exit(1)
}
