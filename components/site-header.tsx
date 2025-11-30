"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8 max-w-5xl">
                <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary/10 p-1.5 rounded-lg cursor-pointer"
                    >
                        <Activity className="h-5 w-5 text-primary" />
                    </motion.div>
                    <span>Mersad</span>
                </div>

                <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground bg-secondary/50 p-1 rounded-full border">
                    <Link href="/" className="px-4 py-1.5 rounded-full hover:bg-background hover:text-foreground hover:shadow-sm transition-all duration-200 data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm">Status</Link>
                    <Link href="/incidents" className="px-4 py-1.5 rounded-full hover:bg-background hover:text-foreground hover:shadow-sm transition-all duration-200">History</Link>
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button size="sm" asChild className="rounded-full px-6 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <Link href="https://github.com/megoxv/mersad">
                            Get in touch
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
