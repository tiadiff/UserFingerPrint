import React, { useState, useEffect } from 'react';
import { 
  getScreenFingerprint,
  getWebGLFingerprint, 
  getHardwareFingerprint,
  generateVisitorId
} from './utils/fingerprinting';

const App: React.FC = () => {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  useEffect(() => {
    const generateKey = async () => {
      // Clear logs on remount/strict mode
      setLogs([]); 
      addLog("INIT_HARDWARE_IDENTITY_PROTOCOL...");
      
      const start = performance.now();

      // 1. Screen / Monitor Physics
      addLog("MEASURING_DISPLAY_PHYSICS...");
      const screen = await getScreenFingerprint();
      
      // 2. GPU Hardware
      addLog("EXTRACTING_GPU_SILICON_ID...");
      const webgl = await getWebGLFingerprint();
      
      // 3. Core Hardware
      addLog("QUERYING_CPU_ARCHITECTURE...");
      const hardware = await getHardwareFingerprint();

      addLog("NORMALIZING_CROSS_BROWSER_SIGNALS...");
      
      // Generate Hash
      const id = await generateVisitorId({
        screen,
        webgl,
        hardware
      });

      const end = performance.now();
      addLog(`HASH_CONVERGENCE_COMPLETE (${Math.round(end - start)}ms)`);
      
      setVisitorId(id);
    };

    generateKey();
  }, []);

  const copyToClipboard = () => {
    if (visitorId) {
      navigator.clipboard.writeText(visitorId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8 flex flex-col items-center justify-center selection:bg-green-900 selection:text-white">
      <div className="w-full max-w-2xl">
        <div className="mb-8 border-b border-green-900 pb-4">
          <h1 className="text-xl font-bold tracking-widest text-green-400">
            DEVICE_HARDWARE_ID_V4
          </h1>
          <div className="text-xs text-green-800 mt-1">
            CROSS_BROWSER_PERSISTENCE_MODE // WEBGL_GPU_CORE
          </div>
        </div>

        <div className="space-y-1 mb-12 text-sm opacity-80 h-48 overflow-hidden flex flex-col justify-end">
          {logs.map((log, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {log}
            </div>
          ))}
        </div>

        {visitorId ? (
          <div className="animate-in zoom-in duration-500">
             <div className="text-xs text-green-700 mb-2 uppercase tracking-widest">Persistent Hardware Key</div>
             <div 
                onClick={copyToClipboard}
                className="relative group cursor-pointer bg-green-900/10 border border-green-500/30 p-6 rounded hover:bg-green-900/20 transition-all hover:border-green-500"
              >
                <code className="text-2xl sm:text-4xl break-all font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                  {visitorId}
                </code>
                
                <div className="absolute top-2 right-2 text-xs text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                   {copied ? '[COPIED]' : '[CLICK_TO_COPY]'}
                </div>
             </div>
             <div className="mt-4 text-center text-xs text-green-800">
               HASH: {visitorId.substring(0,8)}... | SOURCE: GPU+CPU+SCREEN
             </div>
             <div className="mt-2 text-center text-[10px] text-green-900/60 uppercase">
               Ignores Rendering Engines (Skia/Gecko) for Stability
             </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="w-4 h-4 bg-green-500 animate-ping rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;