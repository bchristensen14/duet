interface ImportMetaEnv {
  /** Google Form ID, from https://docs.google.com/forms/d/e/<ID>/viewform */
  readonly VITE_WAITLIST_FORM_ID?: string
  /** Question IDs for the Email and Feedback questions, e.g. entry.1234567890 */
  readonly VITE_WAITLIST_EMAIL_ENTRY?: string
  readonly VITE_WAITLIST_FEEDBACK_ENTRY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
