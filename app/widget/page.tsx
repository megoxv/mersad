"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, AlertTriangle } from "lucide-react"

interface StatusDataPoint {
    timestamp: string
    id: string
    status: 'up' | 'down'
}

interface MonitorConfig {
    id: string
}

export default function WidgetPage() {
    const [status, setStatus] = useState<'loading' | 'up' | 'down'>('loading')

    useEffect(() => {
        async function fetchData() {
            try {
                const owner = process.env.NEXT_PUBLIC_REPO_OWNER || 'megoxv'
                const repo = process.env.NEXT_PUBLIC_REPO_NAME || 'mersad'
                const branch = 'main'

                const isDev = process.env.NODE_ENV === 'development'
                const configUrl = isDev ? '/api/monitor-config' : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/monitor.config.json`
                const dataUrl = isDev ? '/api/status-data' : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/status-data.json`

                const [configRes, dataRes] = await Promise.all([fetch(configUrl), fetch(dataUrl)])
                const config: MonitorConfig[] = await configRes.json()
                const data: StatusDataPoint[] = await dataRes.json()

                // Check if all monitors are up
                const monitorStatus = config.map(monitor => {
                    const monitorData = data.filter(d => d.id === monitor.id)
                    const lastCheck = monitorData[monitorData.length - 1]
                    return lastCheck?.status === 'up'
                })

                const globalStatus = monitorStatus.every(s => s)
                setStatus(globalStatus ? 'up' : 'down')
            } catch (error) {
                console.error("Failed to fetch status", error)
                setStatus('down') // Fail safe
            }
        }

        fetchData()
    }, [])

    if (status === 'loading') return null

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium w-fit ${status === 'up'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            {status === 'up' ? (
                <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Systems Operational</span>
                </>
            ) : (
                <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>System Issues</span>
                </>
            )}
        </div>
    )
}
