export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  dateLabel: string;
  read: string;
};

export const POSTS: Post[] = [
  {
    slug: "how-much-do-orlando-real-estate-agents-make",
    title: "How much do real estate agents make in Orlando?",
    excerpt:
      "The honest math behind an Orlando agent's income — how deals, price, commission rate, your split, and brokerage fees actually decide your take-home.",
    date: "2026-06-12",
    dateLabel: "June 12, 2026",
    read: "6 min read",
  },
  {
    slug: "real-estate-brokerage-fees-explained",
    title: "Real estate brokerage fees explained: desk, tech, royalty & E&O",
    excerpt:
      "Desk fees, technology fees, royalty splits, transaction fees, caps, and E&O — what each one is, how they stack up, and which ones quietly eat your income.",
    date: "2026-06-12",
    dateLabel: "June 12, 2026",
    read: "5 min read",
  },
  {
    slug: "questions-to-ask-before-joining-a-brokerage",
    title: "12 questions to ask before you join a real estate brokerage",
    excerpt:
      "Before you sign with any brokerage, get clear answers to these 12 questions on splits, fees, support, and what happens to your deals if you ever leave.",
    date: "2026-06-12",
    dateLabel: "June 12, 2026",
    read: "5 min read",
  },
];
