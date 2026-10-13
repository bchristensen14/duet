interface ImportMetaEnv {
  /** Form endpoint that receives waitlist signups, e.g. https://formspree.io/f/abcdwxyz */
  readonly VITE_WAITLIST_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
