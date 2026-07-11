import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { HandTrackingOverlay } from "./components/HandTrackingOverlay";
import { Suspense, useState, useEffect } from "react";
import { generateModel } from "./services/aiGeneration";
import { handStore } from './state/handStore';
import type { HandData } from './state/handStore';

function App() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("System Ready");
  const [isExploded, setIsExploded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYS] STARK OS v1.0 initialized", "[SYS] Tracking modules online"]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
  };

  useEffect(() => {
    const unsub = handStore.subscribe((data: HandData) => {
      if (data.isPinching && status !== "Object Linked") {
        setStatus("Object Linked");
        addLog("PROTOCOL: Neural link established");
      } else if (!data.isPinching && status === "Object Linked") {
        setStatus("System Ready");
        addLog("PROTOCOL: Link severed");
      }
    });
    return () => unsub();
  }, [status]);

  const toggleExplode = () => {
    const nextState = !isExploded;
    setIsExploded(nextState);
    handStore.update({ isExploded: nextState });
    setStatus(nextState ? "Analyzing Components..." : "Assembling...");
    addLog(nextState ? "COMMAND: Explode view" : "COMMAND: Assemble view");
    setTimeout(() => {
      setStatus(nextState ? "System Exploded" : "Model Assembled");
      addLog(nextState ? "VIEW: Exploded" : "VIEW: Unified");
    }, 1000);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setStatus("Analyzing Prompt...");
    addLog(`USER_REQUEST: ${prompt}`);
    
    try {
      await generateModel(prompt);
      setStatus("Model Generated");
      addLog(`SUCCESS: ${prompt} generated`);
    } catch (err) {
      setStatus("Error Generating Model");
      addLog(`ERROR: Generation failed`);
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  return (
    <div className="w-full h-full bg-[#050505] relative cursor-crosshair">
      {/* 3D Scene */}
      <Canvas shadows gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-hologram-blue hologram-glow">
              STARK LAB <span className="text-sm font-normal opacity-50">V1.0</span>
            </h1>
            <p className="text-xs text-hologram-blue opacity-70">3D AI DESIGN SYSTEM</p>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-panel px-4 py-2 text-xs text-white uppercase tracking-widest border border-hologram-blue/30">
              {status}
            </div>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className={`glass-panel px-4 py-2 text-xs uppercase tracking-widest border border-hologram-blue/30 transition-all pointer-events-auto ${showHelp ? 'bg-hologram-blue/20 text-white' : 'text-hologram-blue hover:bg-hologram-blue/10'}`}
            >
              {showHelp ? "Close Help" : "Gesture Guide"}
            </button>
            <button 
              onClick={toggleExplode}
              className={`glass-panel px-4 py-2 text-xs uppercase tracking-widest border border-hologram-blue/30 transition-all pointer-events-auto ${isExploded ? 'bg-hologram-blue/20 text-white' : 'text-hologram-blue hover:bg-hologram-blue/10'}`}
            >
              {isExploded ? "Assemble" : "Explode"}
            </button>
          </div>
        </header>

        {/* Gesture Guide Panel */}
        {showHelp && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md pointer-events-auto animate-in zoom-in duration-300">
            <div className="glass-panel p-6 border-hologram-blue/40 bg-black/80">
              <h2 className="text-hologram-blue text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-hologram-blue animate-pulse" />
                Hand Gesture Protocol
              </h2>
              <div className="space-y-4 text-[11px] text-white/80 leading-relaxed font-mono">
                <div>
                  <div className="text-hologram-blue mb-1">■ SINGLE HAND</div>
                  <div>• PINCH: Grab and Move Object</div>
                  <div>• OPEN PALM: Release Object</div>
                </div>
                <div>
                  <div className="text-hologram-blue mb-1">■ DUAL HAND (PINCH BOTH)</div>
                  <div>• APART/TOGETHER: Scale Object</div>
                  <div>• ROTATE ARMS: Rotate Object</div>
                </div>
                <div className="pt-4 border-t border-hologram-blue/20 text-[9px] text-hologram-blue/60 italic">
                  * Ensure hands are well-lit for optimal tracking.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Logs */}
        <div className="absolute top-24 left-8 pointer-events-none text-[10px] font-mono text-hologram-blue/60 flex flex-col gap-1">
          {logs.map((log, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-left duration-300">
              {log}
            </div>
          ))}
        </div>

        {/* Footer Prompt */}
        <footer className="w-full max-w-2xl mx-auto pointer-events-auto">
          <div className="glass-panel p-4 flex gap-4 items-center">
            <div className={`w-3 h-3 rounded-full ${isGenerating ? 'bg-yellow-400 animate-spin' : 'bg-hologram-blue animate-pulse'}`} />
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like to design today?"
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2 bg-hologram-blue/20 hover:bg-hologram-blue/40 disabled:opacity-50 text-hologram-blue rounded-md transition-all border border-hologram-blue/50 text-sm font-semibold whitespace-nowrap"
            >
              {isGenerating ? "GENERATING..." : "GENERATE"}
            </button>
          </div>
        </footer>
      </div>

      {/* Camera Preview */}
      <div className="absolute top-24 right-8 w-64 aspect-video glass-panel overflow-hidden border-hologram-blue/20 pointer-events-auto">
        <HandTrackingOverlay />
      </div>
    </div>
  );
}

export default App;
