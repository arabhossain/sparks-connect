import { useState, useEffect } from 'react'
import { TerminalSquare, ChevronLeft, ChevronRight, Activity, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useParams, Link } from 'react-router-dom'
import { useDebounce } from 'use-debounce'

export function SessionLogs() {
    const { sessionId } = useParams<{ sessionId: string }>()
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 })
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch] = useDebounce(searchTerm, 500)

    const fetchLogs = (page: number, search: string) => {
        setLoading(true)
        const qs = new URLSearchParams({ page: page.toString() })
        if (search) qs.append('search', search)

        fetch(`/api/client/logs/session/${sessionId}?${qs.toString()}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setLogs(data.data)
                    setMeta(data.meta)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchLogs(1, debouncedSearch)
    }, [sessionId, debouncedSearch])

    return (
        <div className="space-y-8 animate-fade-in relative z-10 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col mb-4">
                <Link to="/mypage/logs" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors w-fit group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to History
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Activity className="mr-3 w-8 h-8 text-primary" /> Session Inspect
                    </h1>
                    <p className="text-muted-foreground mt-1 text-xs md:text-sm font-mono break-all">
                        {sessionId}
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Filter specific commands..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 border-white/10 bg-black/40"
                    />
                </div>
            </div>

            <div className="bg-[#121212] border border-white/10 rounded-xl shadow-2xl flex flex-col min-h-[500px]">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <span className="text-sm font-medium text-muted-foreground">Recorded Telemetry Output</span>
                    {loading && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
                </div>

                <div className="flex-1 p-4 space-y-2">
                    {loading && logs.length === 0 ? (
                        <div className="py-24 text-center text-muted-foreground animate-pulse">Establishing log stream...</div>
                    ) : logs.length === 0 ? (
                        <div className="py-24 text-center text-muted-foreground flex flex-col items-center">
                            <TerminalSquare className="w-10 h-10 opacity-30 mb-4" />
                            No commands matching search criteria.
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="bg-black/40 border border-white/5 rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="text-xs text-muted-foreground md:w-28 flex-shrink-0 flex flex-row md:flex-col justify-between md:items-end md:justify-center">
                                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                    <span className="text-[10px] opacity-50">{new Date(log.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="hidden md:block w-px self-stretch bg-white/10" />
                                <div className="font-mono text-sm text-green-400 flex-1 break-all bg-black/60 p-3 rounded border border-white/5 shadow-inner">
                                    <span className="text-emerald-500/50 mr-3 select-none">❯</span>
                                    {log.details?.command || JSON.stringify(log.details)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {!loading && meta.pages > 1 && (
                    <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/20 mt-auto rounded-b-xl">
                        <span className="text-xs text-muted-foreground font-medium">
                            Viewing page {meta.page} of {meta.pages} ({meta.total} captures)
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline" size="sm"
                                disabled={meta.page <= 1}
                                onClick={() => fetchLogs(meta.page - 1, debouncedSearch)}
                                className="bg-transparent border-white/10 hover:bg-white/5"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                disabled={meta.page >= meta.pages}
                                onClick={() => fetchLogs(meta.page + 1, debouncedSearch)}
                                className="bg-transparent border-white/10 hover:bg-white/5"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
