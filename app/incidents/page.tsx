"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PageWrapper } from "@/components/page-wrapper"
import { motion } from "framer-motion"

interface StatusDataPoint {
    timestamp: string
    id: string
    status: 'up' | 'down'
}

interface MonitorConfig {
    id: string
    name: string
}

interface Incident {
    id: string
    monitorName: string
    startTime: string
    endTime?: string
    duration: string
}

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
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

                const [configRes, dataRes] = await Promise.all([fetch(configUrl), fetch(dataUrl)])
                const config: MonitorConfig[] = await configRes.json()
                const data: StatusDataPoint[] = await dataRes.json()

                // Process data to find incidents (consecutive 'down' status)
                const processedIncidents: Incident[] = []

                config.forEach(monitor => {
                    const monitorData = data.filter(d => d.id === monitor.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

                    let currentIncident: Partial<Incident> | null = null

                    monitorData.forEach((point, index) => {
                        if (point.status === 'down') {
                            if (!currentIncident) {
                                currentIncident = {
                                    id: `${monitor.id}-${index}`,
                                    monitorName: monitor.name,
                                    startTime: point.timestamp
                                }
                            }
                        } else if (point.status === 'up' && currentIncident) {
                            // Incident ended
                            const endTime = point.timestamp
                            const start = new Date(currentIncident.startTime!)
                            const end = new Date(endTime)
                            const durationMs = end.getTime() - start.getTime()
                            const durationMinutes = Math.round(durationMs / 60000)

                            processedIncidents.push({
                                ...currentIncident as Incident,
                                endTime,
                                duration: durationMinutes < 1 ? '< 1m' : `${durationMinutes}m`
                            })
                            currentIncident = null
                        }
                    })

                    // If still down at the end
                    if (currentIncident) {
                        processedIncidents.push({
                            ...currentIncident as Incident,
                            duration: 'Ongoing'
                        })
                    }
                })

                // Sort by date desc
                setIncidents(processedIncidents.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()))

            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Group by month
    const groupedIncidents = incidents.reduce((acc, incident) => {
        const month = new Date(incident.startTime).toLocaleString('default', { month: 'long', year: 'numeric' })
        if (!acc[month]) acc[month] = []
        acc[month].push(incident)
        return acc
    }, {} as Record<string, Incident[]>)

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <PageWrapper>
                    <h1 className="text-3xl font-bold mb-8">Incident History</h1>

                    {loading ? (
                        <div className="space-y-8">
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-8 w-32 rounded-md" />
                                    <div className="space-y-4">
                                        {[1, 2].map((j) => (
                                            <Skeleton key={j} className="h-[140px] w-full rounded-xl" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : incidents.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/10">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No incidents reported</h3>
                            <p className="text-muted-foreground">All systems have been operational for the recorded history.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedIncidents).map(([month, monthIncidents], monthIndex) => (
                                <motion.div
                                    key={month}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: monthIndex * 0.1 }}
                                >
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        {month}
                                    </h2>
                                    <div className="space-y-4">
                                        {monthIncidents.map((incident, index) => (
                                            <motion.div
                                                key={incident.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: (monthIndex * 0.1) + (index * 0.05) }}
                                            >
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                {incident.monitorName} Down
                                                            </CardTitle>
                                                            <Badge variant={incident.endTime ? "outline" : "destructive"}>
                                                                {incident.endTime ? "Resolved" : "Ongoing"}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-sm text-muted-foreground flex flex-col gap-1">
                                                            <p>
                                                                Started: {new Date(incident.startTime).toLocaleString()}
                                                            </p>
                                                            {incident.endTime && (
                                                                <p>
                                                                    Resolved: {new Date(incident.endTime).toLocaleString()}
                                                                </p>
                                                            )}
                                                            <p className="font-medium text-foreground mt-1">
                                                                Duration: {incident.duration}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </PageWrapper>
            </main>
            <SiteFooter />
        </div>
    )
}
