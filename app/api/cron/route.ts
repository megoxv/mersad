import { NextResponse } from 'next/server';

export async function GET() {
    const GITHUB_PAT = process.env.GITHUB_PAT;
    const REPO_OWNER = process.env.NEXT_PUBLIC_REPO_OWNER || 'megoxv'; // Replace with actual owner or env
    const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || 'mersad';   // Replace with actual repo or env

    if (!GITHUB_PAT) {
        return NextResponse.json({ error: 'Missing GITHUB_PAT' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${GITHUB_PAT}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_type: 'trigger-monitor',
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error: `GitHub API error: ${error}` }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
