"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { UptimeBar } from "@/components/uptime-bar"
import { CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface StatusDataPoint {
    timestamp: string
    id: string
    status: 'up' | 'down'
    latency: number
}

interface MonitorConfig {
    id: string
    name: string
    url: string
}

export function Dashboard() {
    const [data, setData] = useState<StatusDataPoint[]>([])
    const [config, setConfig] = useState<MonitorConfig[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const owner = process.env.NEXT_PUBLIC_REPO_OWNER || 'megoxv'
                const repo = process.env.NEXT_PUBLIC_REPO_NAME || 'mersad'
                const branch = 'main'

                const isDev = process.env.NODE_ENV === 'development'
                const configUrl = isDev ? '/api/monitor-config' : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/monitor.config.json`
                const dataUrl = isDev ? '/api/status-data' : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/status-data.json`

                const configRes = await fetch(configUrl)
                const configData = await configRes.json()
                setConfig(configData)

                const dataRes = await fetch(dataUrl)
                const statusData = await dataRes.json()
                setData(statusData)
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        // Poll every minute
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="space-y-10 max-w-5xl mx-auto">
                <Skeleton className="h-[300px] w-full rounded-3xl" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    // Process data per monitor
    const monitorStatus = config.map(monitor => {
        const monitorData = data.filter(d => d.id === monitor.id)
        const lastCheck = monitorData[monitorData.length - 1]
        const isUp = lastCheck?.status === 'up'

        // Calculate uptime (last 50 checks)
        const recentChecks = monitorData.slice(-50)
        const upCount = recentChecks.filter(d => d.status === 'up').length
        const uptime = recentChecks.length > 0 ? ((upCount / recentChecks.length) * 100).toFixed(3) : "100.000"

        return {
            ...monitor,
            isUp,
            uptime,
            lastLatency: lastCheck?.latency || 0,
            history: monitorData
        }
    })

    const globalStatus = monitorStatus.every(m => m.isUp)

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            {/* Global Status Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative overflow-hidden rounded-3xl p-10 text-center transition-all duration-500 ${globalStatus
                    ? 'bg-gradient-to-b from-green-50 to-white border border-green-100 dark:from-green-950/30 dark:to-background dark:border-green-900/30'
                    : 'bg-gradient-to-b from-red-50 to-white border border-red-100 dark:from-red-950/30 dark:to-background dark:border-red-900/30'
                    }`}>
                <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className={`rounded-full p-4 shadow-xl ring-8 ${globalStatus ? 'bg-green-500 ring-green-500/20 text-white' : 'bg-red-500 ring-red-500/20 text-white'
                            }`}>
                        {globalStatus ? (
                            <CheckCircle2 className="h-12 w-12" />
                        ) : (
                            <AlertTriangle className="h-12 w-12" />
                        )}
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            {globalStatus ? "All systems operational" : "Major outage detected"}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {globalStatus
                                ? "All services are running smoothly. No incidents reported today."
                                : "We are currently experiencing issues with some of our services. Our team is investigating."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/50 px-4 py-1.5 rounded-full border backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${globalStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${globalStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </span>
                        Last updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </motion.div>

            {/* Monitor List */}
            <div className="grid gap-4">
                {monitorStatus.map((monitor, index) => (
                    <motion.div
                        key={monitor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                    >
                        <Collapsible>
                            <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/50 transition-all hover:shadow-md hover:ring-border bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-0">
                                    <div className="p-6 flex flex-col gap-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${monitor.isUp ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-400' : 'bg-red-50 border-red-100 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400'
                                                    }`}>
                                                    {monitor.isUp ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg leading-none tracking-tight mb-1.5">{monitor.name}</h3>
                                                    <a href={monitor.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline decoration-border underline-offset-4">
                                                        {monitor.url.replace(/^https?:\/\//, '')}
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="hidden sm:flex flex-col items-end gap-0.5">
                                                    <span className={`text-sm font-bold ${monitor.isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {monitor.uptime}%
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Uptime</span>
                                                </div>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <UptimeBar data={monitor.history.map(d => ({ status: d.status, date: d.timestamp }))} />
                                        </div>
                                    </div>

                                    <CollapsibleContent>
                                        <div className="bg-muted/30 border-t px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                                                <Badge variant={monitor.isUp ? "default" : "destructive"} className="rounded-md px-2.5 py-0.5 shadow-none font-medium">
                                                    {monitor.isUp ? "Operational" : "Downtime"}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Latency</p>
                                                <p className="text-sm font-semibold">{monitor.lastLatency}ms</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Checked</p>
                                                <p className="text-sm font-semibold">Every 1 min</p>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </CardContent>
                            </Card>
                        </Collapsible>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
