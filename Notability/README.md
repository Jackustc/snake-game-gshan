# Notability Student Guide

A responsive promotional website for Notability as a student note-taking app.

## Analytics

The site includes two layers of visitor tracking:

- Vercel Web Analytics via `@vercel/analytics`, which reports visitor counts, page views, referrers, and source data in Vercel after deployment.
- A footer widget that shows this browser's local visit count, detected source, and landing page using `localStorage`, `document.referrer`, and `utm_source`.

## Run Locally

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Deploy

```bash
vercel --prod
```

Enable Web Analytics for the project in the Vercel dashboard after deployment if it is not already active.
