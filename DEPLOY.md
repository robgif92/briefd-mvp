# Deploying Briefd to Vercel

## Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit — briefd mvp"
```

Then go to github.com → New Repository → name it "briefd-mvp" → copy the repo URL and run:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2 — Connect to Vercel
- Go to vercel.com
- Click "Add New Project"
- Click "Import Git Repository"
- Select `briefd-mvp`
- Click Deploy

## Step 3 — Add Environment Variables
In Vercel dashboard → your project → Settings → Environment Variables → add:
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (set this to your vercel deployment URL)

## Step 4 — Add Vercel URL to Tally webhook
- Copy your Vercel URL (e.g. `https://briefd-mvp.vercel.app`)
- Go to tally.so → your form → Integrate → Webhooks
- Paste: `https://briefd-mvp.vercel.app/api/webhook`
- Save
