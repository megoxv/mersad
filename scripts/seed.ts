import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'status-data.json');
const CONFIG_FILE = path.join(process.cwd(), 'monitor.config.json');

interface MonitorConfig {
    id: string;
    name: string;
}

interface StatusDataPoint {
    timestamp: string;
    id: string;
    status: 'up' | 'down';
    latency: number;
}

function generateData() {
    const config: MonitorConfig[] = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    const data: StatusDataPoint[] = [];
    const now = Date.now();
    const days = 90;
    // const pointsPerDay = 24 * 6; // Every 10 minutes roughly, or just enough to fill gaps
    // Actually, the UptimeBar just needs "days" or a list of incidents.
    // But our current implementation of Dashboard calculates uptime from "recentChecks".
    // And UptimeBar takes "history".

    // Let's generate 1 point per hour for 90 days to keep file size manageable but realistic enough
    const totalPoints = days * 24;

    config.forEach(monitor => {
        for (let i = 0; i < totalPoints; i++) {
            const time = now - (totalPoints - i) * 60 * 60 * 1000;

            // Simulate 99.9% uptime
            const isDown = Math.random() > 0.999;
            // Simulate latency (random between 20ms and 150ms, spikes if down)
            const latency = isDown ? 0 : Math.floor(Math.random() * 130) + 20;

            data.push({
                id: monitor.id,
                timestamp: new Date(time).toISOString(),
                status: isDown ? 'down' : 'up',
                latency
            });
        }
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Generated ${data.length} data points in ${DATA_FILE}`);
}

generateData();
