> **What is in this snapshot.** This repository is a snapshot of [elirc/jstrain3](https://github.com/elirc/jstrain3), taken before that repo added its `astraupskill/` course and `tests/` folder. Unlike the maintained repo, it also carries three DeskPilot folders:
>
> - [`deskpilot-clean/`](deskpilot-clean/) is the working support-ticket app (Next.js 14, JSON-file store, no database). Start with [`deskpilot-clean/_learning/00-ARCHITECTURE.md`](deskpilot-clean/_learning/00-ARCHITECTURE.md). It is an older copy of [elirc/deskpilot-clean](https://github.com/elirc/deskpilot-clean): its `src/lib/store.ts` predates that repo's no-op update fix, and its docs were re-checked against this copy on 2026-10-06.
> - [`deskpilot/`](deskpilot/) and [`deskpilot-app/`](deskpilot-app/) are unmodified `create-next-app` scaffolds. Their `src/app/page.tsx` is byte-identical to the one at this root.
> - [`docs/deskpilot-build-prompt-expanded.md`](docs/deskpilot-build-prompt-expanded.md) is the phased build specification for DeskPilot.
>
> The root app itself is the same unmodified scaffold.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
