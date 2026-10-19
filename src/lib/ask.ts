/** Example requests shown under the "What kind of collaboration…" box on the landing page and in the demo. */
export const EXAMPLES = [
  {
    label: 'Singer-songwriter → producer',
    text: "I'm a singer-songwriter in Copenhagen looking for a producer for my first EP, something indie pop.",
  },
  {
    label: 'Coffee brand → photographer',
    text: "We're a small coffee brand in Copenhagen and need a photographer and a graphic designer for our new packaging.",
  },
  {
    label: 'Short film → composer',
    text: "I'm a filmmaker making a short documentary and need a composer for an ambient film score.",
  },
  {
    label: 'Band → drummer',
    text: "We're an indie rock band from Aarhus looking for a drummer and someone to shoot a music video.",
  },
]

/** Demo route (hash) that shows matches for a request. The text stays in the hash, so it never reaches the server. */
export const findPath = (q: string) => `/find?q=${encodeURIComponent(q.trim())}`
