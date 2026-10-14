#!/usr/bin/env node
// Reads a public Google Form and prints the .env lines the waitlist needs.
// Usage: npm run waitlist:ids -- "<the form's responder link>"   (forms.gle and editor links work too)
//
// The site posts to Google in no-cors mode, so it can't see when Google rejects a signup.
// This script is the safety net: it refuses forms whose settings would make Google reject
// every anonymous signup, and says which setting to change.

const SIGN_IN_HELP =
  'Make sure the form is published, and under Published → Manage → General access choose "Anyone with the link". ' +
  'Also check Settings → Responses: "Collect email addresses" = Do not collect, "Limit to 1 response" = off. ' +
  'School or work (Google Workspace) accounts may not allow public forms; if so, create the form with a personal Google account.'

const url = process.argv[2]
if (!url) fail('Usage: npm run waitlist:ids -- "<Google Form link>"')

const res = await fetch(url, { redirect: 'follow' })
const html = await res.text()

if (res.status === 401 || /accounts\.google\.com/.test(res.url) || /data-sign-in-to-continue="true"/.test(html)) {
  fail(`The form asks visitors to sign in to Google, so the site can't submit to it.\n${SIGN_IN_HELP}`)
}
if (!res.ok) fail(`Google returned HTTP ${res.status} for that link. Use the form's responder link (Published → Copy responder link).`)
if (/closedform/.test(res.url) || /no longer accepting responses/i.test(html)) {
  fail('The form is not accepting responses. Turn "Accepting responses" on under Published.')
}

const raw = html.match(/FB_PUBLIC_LOAD_DATA_ = (\[[\s\S]*?\])\s*;\s*<\/script>/)?.[1]
if (!raw) fail("Couldn't read the form's questions from that page. Use the form's responder link (Published → Copy responder link).")
const data = JSON.parse(raw)

// The page itself carries the public form ID, so editor and /u/1/ links work too.
const formId =
  (typeof data[14] === 'string' ? data[14].replace(/^e\//, '') : '') ||
  html.match(/\/forms\/(?:u\/\d+\/)?d\/e\/([\w-]+)\/formResponse/)?.[1] ||
  ''
if (!/^1FAIpQL[\w-]{40,}$/.test(formId)) fail(`Couldn't find the form's public ID (got "${formId}").`)

// Form settings live in data[1][10]: [6] is email collection (1 = do not collect, 2 = verified, 3 = responder input),
// [1] is "Limit to 1 response". Fail closed if Google changes this layout.
const settings = data[1]?.[10]
if (!Array.isArray(settings) || ![1, 2, 3].includes(settings[6])) {
  fail("Couldn't verify the form's settings (Google may have changed its page). Submit a test signup and check Responses.")
}
if (settings[6] !== 1) {
  fail(
    `"Collect email addresses" is set to ${settings[6] === 2 ? 'Verified' : 'Responder input'}. ` +
      'Set it to "Do not collect" in Settings → Responses; the page sends the email as a normal question.',
  )
}
if (settings[1] === 1) fail(`"Limit to 1 response" is on, which requires a Google sign-in. Turn it off in Settings → Responses.`)

const items = data[1]?.[1] ?? []
if (items.some((q) => q?.[3] === 8)) fail('The form has more than one section. Remove the extra sections; the waitlist needs a one-page form.')

const TEXT_TYPES = [0, 1] // short answer, paragraph
const questions = items
  .filter((q) => Array.isArray(q?.[4]))
  .map((q) => ({ title: String(q[1] ?? ''), type: q[3], entry: `entry.${q[4][0][0]}`, required: q[4][0][2] === 1 }))

console.log('Questions found:')
for (const q of questions) console.log(`  ${q.entry}  ${q.title}${q.required ? ' (required)' : ''}`)

const email = questions.find((q) => TEXT_TYPES.includes(q.type) && /e-?mail/i.test(q.title))
if (!email) fail('\nNo short-answer question with "Email" in its title. Add one called "Email".')
const feedback = questions.find(
  (q) => q !== email && TEXT_TYPES.includes(q.type) && /feedback|feature|comment|suggest|idea|wish|want|anything/i.test(q.title),
)

const extraRequired = questions.filter((q) => q.required && q !== email)
if (extraRequired.length) {
  fail(`\nMake these questions optional, or Google rejects signups without them: ${extraRequired.map((q) => q.title).join(', ')}`)
}
if (!feedback) console.warn('\n! No feedback question found, so feedback from the page won\'t be saved. Add a paragraph question called "Feedback".')

console.log('\nReplace the three VITE_WAITLIST_* lines in .env with:\n')
console.log(`VITE_WAITLIST_FORM_ID=${formId}`)
console.log(`VITE_WAITLIST_EMAIL_ENTRY=${email.entry}`)
console.log(`VITE_WAITLIST_FEEDBACK_ENTRY=${feedback?.entry ?? ''}`)
console.log('\nAfter deploying, submit a test signup on the live site and check it appears under Responses.')

function fail(msg) {
  console.error(msg)
  process.exit(1)
}
