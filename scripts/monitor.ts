import fs from 'fs';
import path from 'path';
import { Octokit } from 'octokit';

// Types
interface MonitorConfig {
    id: string;
    name: string;
    url: string;
    method?: string;
}

interface StatusDataPoint {
    timestamp: string;
    id: string;
    status: 'up' | 'down';
    latency: number;
}

// Configuration
const CONFIG_FILE = path.join(process.cwd(), 'monitor.config.json');
const DATA_FILE = path.join(process.cwd(), 'status-data.json');
// const MAX_HISTORY = 1000; // Keep last 1000 data points per monitor to avoid huge file

async function main() {
    console.log('Starting monitoring...');

    // 1. Read Config
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error('Config file not found');
        process.exit(1);
    }
    const config: MonitorConfig[] = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

    // 2. Read Existing Data
    let data: StatusDataPoint[] = [];
    if (fs.existsSync(DATA_FILE)) {
        try {
            data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch {
            console.error('Error reading data file, starting fresh');
        }
    }

    // 3. Check Endpoints
    const timestamp = new Date().toISOString();
    const results: StatusDataPoint[] = [];

    for (const monitor of config) {
        console.log(`Checking ${monitor.name} (${monitor.url})...`);
        const start = performance.now();
        let status: 'up' | 'down' = 'down';
        let latency = 0;

        try {
            const response = await fetch(monitor.url, {
                method: monitor.method || 'GET',
                signal: AbortSignal.timeout(5000), // 5s timeout
            });

            const end = performance.now();
            latency = Math.round(end - start);

            if (response.ok) {
                status = 'up';
            } else {
                console.warn(`  Failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error(`  Error: ${(error as Error).message}`);
        }

        results.push({
            id: monitor.id,
            timestamp,
            status,
            latency,
        });
    }

    // 4. Update Data
    data.push(...results);

    // Prune old data to avoid git issues with large files
    if (data.length > 5000) {
        data = data.slice(-5000);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Data updated.');

    // 5. Manage GitHub Issues (Notifications)
    // We need to detect state changes: UP -> DOWN (Open Issue), DOWN -> UP (Close Issue)
    // This requires looking at the *previous* check for each monitor.

    if (process.env.GITHUB_TOKEN) {
        await manageIssues(results, data, config);
    }
}

async function manageIssues(currentResults: StatusDataPoint[], allData: StatusDataPoint[], config: MonitorConfig[]) {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = process.env.GITHUB_REPOSITORY?.split('/')[0];
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];

    if (!owner || !repo) {
        console.warn('GITHUB_REPOSITORY env var missing, skipping issue management');
        return;
    }

    // Get active issues to avoid duplicates
    // We'll tag issues with the monitor ID in the title, e.g., "DOWN: Google DNS [google-dns]"
    const { data: issues } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        labels: 'incident',
    });

    for (const result of currentResults) {
        const monitor = config.find(c => c.id === result.id);
        if (!monitor) continue;

        const issueTitle = `DOWN: ${monitor.name} [${monitor.id}]`;
        const existingIssue = issues.find(i => i.title === issueTitle);

        if (result.status === 'down') {
            if (!existingIssue) {
                console.log(`Creating issue for ${monitor.name}`);
                await octokit.rest.issues.create({
                    owner,
                    repo,
                    title: issueTitle,
                    body: `Monitor **${monitor.name}** is down at ${result.timestamp}.\nURL: ${monitor.url}`,
                    labels: ['incident'],
                });
            }
        } else {
            // Status is UP
            if (existingIssue) {
                console.log(`Closing issue for ${monitor.name}`);
                await octokit.rest.issues.createComment({
                    owner,
                    repo,
                    issue_number: existingIssue.number,
                    body: `Monitor **${monitor.name}** is back up at ${result.timestamp}.`,
                });
                await octokit.rest.issues.update({
                    owner,
                    repo,
                    issue_number: existingIssue.number,
                    state: 'closed',
                });
            }
        }
    }
}

main().catch(console.error);
