# BerLabs Website

The home of **BerLabs** — a calm, useful newsletter about AI, the internet, and the ideas changing how we make things.

The site introduces the newsletter, highlights the latest dispatch, gives readers a way to subscribe, and provides an archive for published issues. BerLabs is written by Kody and favors thoughtful signal over daily noise.

## What’s here

- A responsive landing page at `/`
- A latest-dispatch feature for the current issue
- A subscribe call-to-action connected to the [BerLabs member portal](https://archive.berlabs.dev/#/portal/signup)
- An issue archive at `/issues`
- BerLabs-specific page metadata and favicon

## Technology

This is a React and TypeScript site built with Next.js-compatible Vinext, Tailwind CSS, and Vite. It is configured for deployment on Cloudflare Workers through the Sites workflow.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Then open the local address printed by the development server (normally `http://localhost:5173`).

## Useful commands

```sh
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Preview the production Worker locally
npm run lint      # Run ESLint
```

## Updating the newsletter

- Update the latest dispatch shown on the home page in `app/page.tsx`.
- Update the list of archived issues in `app/issues/page.tsx`.
- Subscription and issue links point to `archive.berlabs.dev`, where the newsletter is published through Ghost.

The archive is currently curated in the site code. It is designed to be connected to Ghost so newly published issues can appear automatically.

## Project structure

```text
app/
  page.tsx          Landing page
  issues/page.tsx   Newsletter archive
  globals.css       Global styles
components/         Reusable UI components
public/             Static assets
```
