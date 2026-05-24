# Artefakt Lot Scanner — Setup Guide

A mobile web app that scans gallery lot lists (photo or PDF) and saves the data directly into your Artefakt Supabase database.

---

## What you need before starting

- A free GitHub account → github.com
- A free Vercel account → vercel.com
- Your Supabase project URL and service role key (from Supabase dashboard → Settings → API)
- Your Anthropic API key (from console.anthropic.com)

---

## Step 1 — Upload the files to GitHub

1. Go to **github.com** and sign in
2. Click the **+** button (top right) → **New repository**
3. Name it `artefakt-lot-scanner`
4. Leave all other settings as default → click **Create repository**
5. On the next screen, click **uploading an existing file**
6. Drag and drop ALL the files from this folder into the upload area:
   - `public/index.html`
   - `api/artists.js`
   - `api/extract.js`
   - `api/add-artist.js`
   - `api/save.js`
   - `package.json`
   - `vercel.json`
7. Click **Commit changes**

---

## Step 2 — Deploy on Vercel

1. Go to **vercel.com** and sign in (use "Continue with GitHub")
2. Click **Add New → Project**
3. Find `artefakt-lot-scanner` in the list → click **Import**
4. Leave all settings as they are → click **Deploy**
5. Wait ~1 minute for the build to finish
6. Vercel will give you a URL like `artefakt-lot-scanner-abc123.vercel.app`

---

## Step 3 — Add your secret keys

After deploying, you must add three environment variables:

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add these three variables one by one:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://qrvndwlicvenxfewpvtc.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key (starts with `eyJ...`) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (starts with `sk-ant-...`) |

3. After adding all three, go to **Deployments → click the three dots on the latest → Redeploy**

---

## Step 4 — Add to your iPhone home screen

1. Open Safari on your iPhone
2. Go to your Vercel URL (e.g. `artefakt-lot-scanner-abc123.vercel.app`)
3. Tap the **Share** button (the box with an arrow)
4. Tap **Add to Home Screen**
5. Name it **Artefakt** → tap **Add**

It now works like an app on your home screen.

---

## How to use it

1. Open Artefakt on your iPhone
2. Type the gallery name
3. Tap **Take photo** or **Upload PDF**
4. For each unique artist found on the page, confirm or correct the database match
5. Review the extracted lot data — edit any fields that look wrong
6. Tap **Save** — the data goes directly into your Supabase `price_observations` table

---

## Where the data lands in Supabase

- Table: `price_observations`
- Source: `SRC_045` (Gallery Lot List — manual scan)
- `price_type`: `asking_price`
- `price_context`: `gallery_lot_list`
- `confidence_score`: 90 (manual entry, high confidence)

New artists added via the app land in `dk_artists` with their full profile.

---

## Troubleshooting

**"Could not load artists"** — Check your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Vercel environment variables. Make sure you redeployed after adding them.

**"Something went wrong reading the image"** — Check your `ANTHROPIC_API_KEY`. Make sure the photo is clear and well-lit.

**The app looks broken after uploading files** — Make sure you uploaded the `public/` folder with `index.html` inside it, not just `index.html` at the root level.
