import React, { useEffect, useState } from 'react';

export default function Arena() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Fetches from the local game control server (if running locally)
    fetch('http://127.0.0.1:4174/api/logs')
      .then(res => res.json())
      .then(setLogs)
      .catch(() => console.log('Control server offline or unreachable from this context.'));
  }, []);

  return (
    <div className="bg-zinc-50 text-zinc-900 h-screen flex flex-col font-sans overflow-hidden">
      {/* Header Section */}
      <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 text-white p-2 rounded-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">VaultArena <span className="text-zinc-400 font-normal ml-2">[DEMO ENVIRONMENT]</span></h1>
            <p className="text-xs text-zinc-500 font-medium uppercase">Security Competition Framework</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
            <span className="text-sm font-bold text-green-600 uppercase">Active</span>
          </div>
        </div>
      </header>

      {/* Main Arena View */}
      <main className="flex-1 flex min-h-0">
        {/* Sidebar Left: Red Team Logs */}
        <aside className="w-1/3 border-r border-zinc-200 bg-zinc-50/50 flex flex-col">
          <div className="p-3 border-b border-zinc-200 bg-red-50/30">
            <h2 className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Red Team Activity
            </h2>
          </div>
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {logs.filter(l => l.actor === 'red').map((l, i) => (
              <div key={i} className="text-[11px] font-mono p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-400">[{l.timestamp}]</span> <span className="text-red-600 font-bold">{l.type.toUpperCase()}</span>
                <p className="mt-1 text-zinc-600">{l.summary}</p>
                <p className={`italic mt-1 ${l.status === 'success' ? 'text-green-600' : 'text-zinc-400'}`}>Status: {l.status?.toUpperCase() || 'UNKNOWN'}</p>
              </div>
            ))}
            {logs.filter(l => l.actor === 'red').length === 0 && <div className="text-[11px] text-zinc-400 italic p-2">No red team logs available.</div>}
          </div>
        </aside>

        {/* Center: Event Stream */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex-none bg-zinc-50/50">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Global Event Stream</h3>
          </div>
          <div className="flex-1 p-0 overflow-y-auto">
            <table className="w-full text-left text-[11px] border-collapse font-mono">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="py-2 px-4 font-bold text-zinc-400 uppercase">Timestamp</th>
                  <th className="py-2 px-4 font-bold text-zinc-400 uppercase">Actor</th>
                  <th className="py-2 px-4 font-bold text-zinc-400 uppercase">Type</th>
                  <th className="py-2 px-4 font-bold text-zinc-400 uppercase">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {logs.map((l, i) => (
                  <tr key={i} className="hover:bg-zinc-50">
                    <td className="py-2 px-4 text-zinc-400 whitespace-nowrap">{l.timestamp}</td>
                    <td className={`py-2 px-4 font-bold uppercase ${l.actor === 'red' ? 'text-red-600' : l.actor === 'blue' ? 'text-blue-600' : 'text-zinc-600'}`}>{l.actor}</td>
                    <td className="py-2 px-4 uppercase text-zinc-600">{l.type}</td>
                    <td className="py-2 px-4 text-zinc-800">{l.summary}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-zinc-400 italic text-center font-sans text-xs">
                      No events recorded. Run local control server.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar Right: Blue Team Logs */}
        <aside className="w-1/3 border-l border-zinc-200 bg-zinc-50/50 flex flex-col">
          <div className="p-3 border-b border-zinc-200 bg-blue-50/30">
            <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Blue Team Defense
            </h2>
          </div>
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {logs.filter(l => l.actor === 'blue').map((l, i) => (
              <div key={i} className="text-[11px] font-mono p-2 bg-white border border-zinc-200 rounded">
                <span className="text-zinc-400">[{l.timestamp}]</span> <span className="text-blue-600 font-bold">{l.type.toUpperCase()}</span>
                <p className="mt-1 text-zinc-600">{l.summary}</p>
                <p className={`italic mt-1 ${l.status === 'success' ? 'text-green-600' : 'text-zinc-400'}`}>Status: {l.status?.toUpperCase() || 'UNKNOWN'}</p>
              </div>
            ))}
            {logs.filter(l => l.actor === 'blue').length === 0 && <div className="text-[11px] text-zinc-400 italic p-2">No blue team logs available.</div>}
          </div>
        </aside>
      </main>

      {/* Footer Scoreboard */}
      <footer className="h-12 bg-zinc-900 text-white flex items-center px-6 shrink-0 justify-between">
        <div className="flex items-center gap-12">
           <div>
             <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest leading-none mb-1">Status</p>
             <p className="text-xs font-mono font-bold text-green-400">ONLINE</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[10px] font-bold uppercase text-zinc-300 tracking-tighter">Emulator Connected: 127.0.0.1:4174</span>
        </div>
      </footer>
    </div>
  );
}
