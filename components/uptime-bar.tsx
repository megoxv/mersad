"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UptimeBarProps {
    data?: { status: 'up' | 'down', date: string }[]
}

export function UptimeBar({ data = [] }: UptimeBarProps) {
    const days = 90
    const [bars, setBars] = useState<{ status: 'up' | 'down', date: string }[]>([])

    useEffect(() => {
        const timer = setTimeout(() => {
            const today = Date.now()
            const generatedBars = Array.from({ length: days }).map((_, i) => {
                const date = new Date(today - (days - 1 - i) * 24 * 60 * 60 * 1000)
                const dateStr = date.toLocaleDateString()

                const hasDowntime = data.some(d => {
                    const dDate = new Date(d.date)
                    return dDate.toLocaleDateString() === dateStr && d.status === 'down'
                })

                return {
                    status: hasDowntime ? 'down' : 'up',
                    date: dateStr
                } as const
            })
            setBars(generatedBars)
        }, 0)
        return () => clearTimeout(timer)
    }, [data])

    return (
        <div className="w-full">
            <div className="flex gap-[2px] h-10 w-full items-end">
                <TooltipProvider delayDuration={0}>
                    {bars.map((bar, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <div
                                    className={`flex-1 rounded-[2px] transition-all hover:opacity-80 hover:scale-y-110 origin-bottom duration-200 ${bar.status === 'up'
                                        ? 'bg-emerald-500/80 hover:bg-emerald-500 h-8 hover:h-10'
                                        : 'bg-red-500/80 hover:bg-red-500 h-8 hover:h-10'
                                        }`}
                                />
                            </TooltipTrigger>
                            <TooltipContent sideOffset={4} className="text-xs font-medium">
                                <p>{bar.status === 'up' ? 'Operational' : 'Downtime'} on {bar.date}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>90 days ago</span>
                <span>Today</span>
            </div>
        </div>
    )
}
