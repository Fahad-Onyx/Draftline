# Draftline

A Vercel-ready static dashboard for Fahad and his team to manage clients, projects, editor handoffs, budgets, reports, and daily tasks.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Deploy to Vercel

Import this folder as a new GitHub repository in Vercel. No build command or environment variables are required; the app is plain HTML, CSS, and JavaScript.

## Included

- Responsive overview dashboard with weekly pulse, take-home, editor payouts, and project status
- Projects ledger with budgets, statuses, progress, due dates, and brief ingredients
- Editor desk with current assignment, client, editor fee, due date, and previous work
- My tasks view with checkable tasks and calendar
- Reports view with revenue, payout, completion, and margin indicators
- Light/dark theme switch persisted in local storage
- New project dialog, toast feedback, search shortcut, responsive mobile navigation
