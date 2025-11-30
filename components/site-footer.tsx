import Link from "next/link"


export function SiteFooter() {
    return (
        <footer className="border-t py-8 mt-12">
            <div className="container flex flex-col items-center justify-center gap-4 mx-auto px-4">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    Powered by <Link href="https://github.com/megoxv/mersad" target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:underline underline-offset-4">Mersad</Link>
                </div>
            </div>
        </footer>
    )
}
