# Mersad — Open Source Status Page
### Beautiful · Serverless · Powered by GitHub & Vercel · Zero Database

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmegoxv%2Fmersad&env=GITHUB_PAT,NEXT_PUBLIC_REPO_OWNER,NEXT_PUBLIC_REPO_NAME&project-name=mersad&repository-name=mersad&demo-title=Mersad%20Status%20Page&demo-description=Mersad%20is%20a%20modern%2C%20fully%20open-source%20status%20page%20system%20that%20runs%20100%25%20on%20GitHub%20Actions%20and%20Vercel%20%E2%80%94%20no%20database%2C%20no%20backend%20servers%2C%20no%20extra%20costs.&demo-url=https%3A%2F%2Fmersadstatus.vercel.app&demo-image=https%3A%2F%2Fmersadstatus.vercel.app%2Fscreenshot.png)

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mersadstatus.vercel.app)
[![GitHub stars](https://img.shields.io/github/stars/megoxv/mersad?style=for-the-badge&logo=github)](https://github.com/megoxv/mersad/stargazers)
[![License](https://img.shields.io/github/license/megoxv/mersad?style=for-the-badge)](LICENSE)

**Mersad** is a modern, fully open-source status page system that runs 100% on **GitHub Actions** and **Vercel** — no database, no backend servers, no extra costs.

Perfect for indie developers, startups, and SaaS teams who want a professional-looking status page without complexity.

![Mersad Status Page](/public/screenshot.png)

## Features

-   **Serverless Monitoring**: Uses GitHub Actions to check your websites and APIs.
-   **GitOps**: All status data is stored in `status-data.json` within the repository.
-   **Real-time Dashboard**: Built with Next.js and shadcn/ui, featuring uptime bars and latency charts.
-   **Embeddable Widget**: Show your system status on any website.
-   **Incident Management**: Automatically opens and closes GitHub Issues when services go down.
-   **Global Monitoring**: (Simulated) Supports multiple endpoints.
-   **Free to Host**: Runs on Vercel's free tier and GitHub's free Actions minutes.

## Tech Stack

-   **Frontend**: Next.js 16, Tailwind CSS, shadcn/ui, Recharts.
-   **Backend/Job**: GitHub Actions.
-   **Scheduling**: Vercel Cron.
-   **Storage**: Git (JSON file).

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/megoxv/mersad.git
cd mersad
npm install
```

### 2. Configure Monitors

Edit `monitor.config.json` to add your endpoints:

```json
[
  {
    "id": "google-dns",
    "name": "Google DNS",
    "url": "https://dns.google",
    "method": "GET"
  }
]
```

### 3. Run Locally

```bash
# Generate dummy data for testing
npx tsx scripts/seed.ts
  
# Start the dev server
npm run dev
```

Visit `http://localhost:3000`.

## Deployment

### 1. Push to GitHub

Create a new repository on GitHub and push your code.

### 2. Deploy to Vercel

1.  Import your repository into Vercel.
2.  Add the following **Environment Variables**:

| Variable | Description |
| :--- | :--- |
| `GITHUB_PAT` | A Personal Access Token with `repo` scope (to trigger Actions). |
| `NEXT_PUBLIC_REPO_OWNER` | Your GitHub username (e.g., `megoxv`). |
| `NEXT_PUBLIC_REPO_NAME` | Your repository name (e.g., `mersad`). |

3.  Deploy!

### 3. Setup Monitoring (Cron)

Vercel will automatically detect the `vercel.json` configuration and set up a Cron job to hit `/api/cron` every minute.

This API route triggers the `Monitor Status` GitHub Action, which:
1.  Checks all endpoints.
2.  Updates `status-data.json`.
3.  Commits the changes to the repo.
4.  Creates GitHub Issues if a service is down.

## Customization

-   **Theme**: Update `app/globals.css` to change colors.
-   **Frequency**: Edit `vercel.json` to change the cron schedule.

## Embed Widget

You can embed a small status indicator on your marketing site or documentation using an iframe:

```html
<iframe src="https://mersadstatus.vercel.app/widget" height="40" width="200" frameborder="0"></iframe>
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
