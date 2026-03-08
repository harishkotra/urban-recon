import React, { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Zap, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgentTerminalProps {
  isThinking: boolean;
  agentGuess?: { lat: number; lng: number; reasoning: string };
  error?: string;
}

const AgentTerminal: React.FC<AgentTerminalProps> = ({
  isThinking,
  agentGuess,
  error,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isThinking) {
      setLogs([
        "> INITIALIZING QWEN-2.5-VL AGENT...",
        "> CAPTURING IMAGE DATA...",
        "> ANALYZING VISUAL CUES...",
        "> CHECKING ARCHITECTURAL PATTERNS...",
        "> IDENTIFYING FLORA AND FAUNA...",
        "> SCANNING FOR TEXT/SIGNS...",
        "> CALCULATING PROBABLE COORDINATES...",
      ]);
    } else if (agentGuess) {
      setLogs((prev) => [
        ...prev,
        "> ANALYSIS COMPLETE.",
        `> GUESS: ${agentGuess.lat.toFixed(4)}, ${agentGuess.lng.toFixed(4)}`,
        `> REASONING: ${agentGuess.reasoning}`,
      ]);
    } else if (error) {
      setLogs((prev) => [...prev, `> ERROR: ${error}`, "> RETRYING..."]);
    }
  }, [isThinking, agentGuess, error]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="pixel-card h-full flex flex-col overflow-hidden relative">
      <div className="flex items-center gap-2 mb-2 border-b-2 border-black pb-2">
        <Terminal size={16} className="text-[#00ff00]" />
        <span className="pixel-text text-[10px] text-[#00ff00]">AGENT_TERMINAL_V1.0</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-[10px] text-[#00ff00] space-y-1 scrollbar-hide"
      >
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {log}
          </motion.div>
        ))}
        {isThinking && (
          <motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="w-2 h-4 bg-[#00ff00] inline-block ml-1"
          />
        )}
      </div>

      <div className="absolute inset-0 pixel-scanline pointer-events-none" />

      {isThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Cpu size={48} className="text-[#00ff00]" />
            </motion.div>
            <span className="pixel-text text-[#00ff00] animate-pulse">THINKING...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTerminal;
