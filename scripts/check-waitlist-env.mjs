#!/usr/bin/env node
// Warns (never fails) when the waitlist Google Form isn't configured, using Vite's own .env parsing
// so the result matches what the build sees. Prints GitHub Actions ::warning:: annotations.
import { loadEnv } from 'vite'

const env = loadEnv('production', process.cwd())
const id = env.VITE_WAITLIST_FORM_ID?.trim() ?? ''
const email = env.VITE_WAITLIST_EMAIL_ENTRY?.trim() ?? ''

if (!id || !email) {
  console.log("::warning::The waitlist Google Form isn't set in .env, so the landing page won't collect signups. See README → Connecting the waitlist.")
} else if (!/^1FAIpQL[\w-]{40,}$/.test(id)) {
  console.log(`::warning::VITE_WAITLIST_FORM_ID "${id}" isn't a public form ID (is it the editor ID?), so the site stays in preview mode. Re-run npm run waitlist:ids.`)
} else {
  console.log(`Waitlist form configured: ${id}`)
}
