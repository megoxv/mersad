"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataPoint {
    timestamp: string
    latency: number
}

interface LatencyChartProps {
    data: DataPoint[]
}

export function LatencyChart({ data }: LatencyChartProps) {
    // Format data for chart
    const chartData = data.map((d) => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: d.latency,
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Latency History (ms)</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <XAxis
                            dataKey="time"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}ms`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="latency"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
