import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Settings as SettingsIcon,
  MapPin,
  Trophy,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Info,
  Zap,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { locations, Location } from "./locations";
import { solveLocation, AgentGuess } from "./services/lmStudioService";
import PixelMap from "./components/PixelMap";
import AgentTerminal from "./components/AgentTerminal";
import SettingsModal from "./components/SettingsModal";
import BlueprintMap from "./components/BlueprintMap";
import { toJpeg } from 'html-to-image';


const App: React.FC = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "results">("start");
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [agentGuess, setAgentGuess] = useState<AgentGuess | null>(null);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    baseUrl: "/v1",
    model: "qwen/qwen3-vl-8b"
  });

  const currentLocation = locations[currentLocationIndex];

  const handleStartGame = () => {
    setGameState("playing");
    setAgentGuess(null);
    setAgentError(null);
    // Agent solve is now handled by useEffect when gameState becomes "playing"
  };

  const handleAgentSolve = useCallback(async () => {
    if (isAgentThinking) return;
    setIsAgentThinking(true);
    setAgentError(null);
    try {
      // Capture the map as an image
      const mapElement = document.getElementById('blueprint-map');
      if (!mapElement) throw new Error("Map target not found");

      const dataUrl = await toJpeg(mapElement, { quality: 0.95 });

      // Small delay to ensure the map tiles have painted before we capture
      await new Promise(r => setTimeout(r, 800));

      const result = await solveLocation(
        dataUrl,
        currentLocation.hints,
        settings.baseUrl,
        settings.model
      );
      setAgentGuess(result);
      setGameState("results");
    } catch (err: any) {
      setAgentError(err.message || "Failed to connect to agent");
    } finally {
      setIsAgentThinking(false);
    }
  }, [settings.baseUrl, settings.model, isAgentThinking, currentLocation.hints, currentLocationIndex]);


  // Auto-trigger agent guess when game starts or moves to next location
  useEffect(() => {
    if (gameState === "playing" && !agentGuess && !isAgentThinking && !agentError) {
      handleAgentSolve();
    }
  }, [gameState, currentLocationIndex, agentGuess, isAgentThinking, agentError, handleAgentSolve]);

  const handleNextLocation = () => {
    const nextIndex = (currentLocationIndex + 1) % locations.length;
    setCurrentLocationIndex(nextIndex);
    setGameState("playing");
    setAgentGuess(null);
    setAgentError(null);
    // Agent solve is handled by useEffect when index changes and gameState is "playing"
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const agentDistance = agentGuess ? calculateDistance(agentGuess.lat, agentGuess.lng, currentLocation.lat, currentLocation.lng) : null;

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col p-4 md:px-8 md:py-4 overflow-hidden relative">
      {/* Background Scanlines */}
      <div className="fixed inset-0 pixel-scanline pointer-events-none z-50 opacity-30" />

      {/* Header */}
      <header className="flex items-center justify-between mb-4 md:mb-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="pixel-card bg-[#00ff00] p-2">
            <MapPin size={24} className="text-black" />
          </div>
          <div>
            <h1 className="pixel-title text-[20px] md:text-[28px]">URBAN_RECON</h1>
            <p className="pixel-text text-[10px] text-[#888]">ANONYMOUS_URBAN_RECONNAISSANCE</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="pixel-button bg-[#333] hover:bg-[#444]"
        >
          <SettingsIcon size={16} />
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-4 relative z-10 min-h-0">
        <AnimatePresence mode="wait">
          {gameState === "start" ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-8 min-h-0 overflow-y-auto"
            >
              <div className="pixel-card max-w-2xl bg-black/40 backdrop-blur-md p-12 space-y-8">
                <div className="flex justify-center gap-4">
                  <Cpu size={64} className="text-[#00ff00]" />
                  <Zap size={64} className="text-[#ff4e00]" />
                </div>
                <h2 className="pixel-title text-[32px]">READY_TO_ANALYZE?</h2>
                <p className="pixel-text text-[#888] leading-relaxed">
                  Watch the agent use urban planning recognition to identify cities from
                  anonymized map blueprints. Can it spot the Haussmann grid or the L'Enfant diagonal?
                </p>
                <div className="pixel-card bg-black/20 border-[#333] p-4 text-left space-y-2">
                  <p className="pixel-text text-[8px] text-[#00ff00]">SETUP_INSTRUCTIONS:</p>
                  <p className="pixel-text text-[8px] text-[#666]">1. RUN LM STUDIO ON YOUR MACHINE</p>
                  <p className="pixel-text text-[8px] text-[#666]">2. LOAD QWEN3-VL-8B (OR SIMILAR VISION MODEL)</p>
                  <p className="pixel-text text-[8px] text-[#666]">3. ENABLE LOCAL SERVER & ALLOW CORS</p>
                  <p className="pixel-text text-[8px] text-[#666]">4. ENSURE BASE_URL IS ACCESSIBLE FROM THIS BROWSER</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
                  <button onClick={handleStartGame} className="pixel-button text-[14px] px-8 py-4">
                    START_MISSION
                  </button>
                  <button onClick={() => setShowSettings(true)} className="pixel-button bg-[#333] text-[14px] px-8 py-4">
                    CONFIGURE_AGENT
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0"
            >
              {/* Left Column: Image and Agent Terminal */}
              <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
                <div className="pixel-card flex-1 min-h-0 relative overflow-hidden bg-black group">
                  <div id="blueprint-map" className="w-full h-full relative">
                    <BlueprintMap
                      id="blueprint-map-inner"
                      lat={currentLocation.lat}
                      lng={currentLocation.lng}
                      zoom={currentLocation.zoom}
                    />
                    <div className="absolute top-4 left-4 z-[1000] pixel-card bg-black/80 px-2 py-1 border-[#00ff00]/30 mr-20">
                      <p className="pixel-text text-[8px] text-[#00ff00]">ANONYMOUS_MAP_VIEW</p>
                    </div>
                  </div>
                  <div className="absolute top-12 left-4 flex flex-col gap-2 z-[1000]">
                    {currentLocation.hints.map((hint, i) => (
                      <div key={i} className="pixel-card bg-black/60 p-2 text-[8px] pixel-text text-[#00ff00]">
                        HINT_{i + 1}: {hint}
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-4 z-[1000]">
                    <div className="pixel-card bg-black/60 p-2 text-[10px] pixel-text text-[#ff4e00]">
                      LOCATION_ID: {currentLocation.id}
                    </div>
                  </div>
                </div>

                <div className="h-[150px] lg:h-[220px] shrink-0">
                  <AgentTerminal
                    isThinking={isAgentThinking}
                    agentGuess={agentGuess || undefined}
                    error={agentError || undefined}
                  />
                </div>
              </div>

              {/* Right Column: Map and Controls */}
              <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
                <div className="flex-1 min-h-0 relative">
                  <PixelMap
                    actualLocation={gameState === "results" ? currentLocation : undefined}
                    agentGuess={agentGuess || undefined}
                    showResults={gameState === "results"}
                  />
                  {gameState === "playing" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="pixel-card bg-black/80 p-4 text-center">
                        <p className="pixel-text text-[10px] text-[#00ff00]">AGENT_IS_ANALYZING_IMAGE...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pixel-card space-y-4">
                  {gameState === "playing" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="pixel-text text-[10px] text-[#888]">SYSTEM_STATUS:</span>
                        <span className={`pixel-text text-[10px] text-[#00ff00]`}>
                          {isAgentThinking ? "AGENT_COMPUTING" : "WAITING_FOR_AGENT"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAgentSolve}
                          disabled={isAgentThinking}
                          className="pixel-button bg-[#333] flex-1 flex items-center justify-center gap-2"
                        >
                          <Cpu size={16} className={isAgentThinking ? "animate-spin" : ""} />
                          {isAgentThinking ? "PROCESSING..." : "FORCE_RESTART_AGENT"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="pixel-card bg-black/40 p-4 text-center space-y-2">
                        <p className="pixel-text text-[10px] text-[#888]">AGENT_DISTANCE_FROM_TARGET</p>
                        <p className="pixel-text text-[24px] text-[#00ff00]">
                          {agentDistance ? `${agentDistance.toFixed(1)} KM` : "N/A"}
                        </p>
                      </div>

                      <div className="pixel-card bg-[#00ff00]/10 border-[#00ff00]/30 p-4 text-center">
                        <h3 className="pixel-text text-[#00ff00] mb-2">EVALUATION:</h3>
                        <p className="pixel-text text-[10px] text-white">
                          {agentDistance && agentDistance < 100
                            ? "EXCELLENT_ACCURACY._AGENT_IS_A_TRUE_GEOGUESSER."
                            : agentDistance && agentDistance < 1000
                              ? "GOOD_GUESS._RIGHT_REGION_BUT_COULD_BE_MORE_PRECISE."
                              : "AGENT_NEEDS_MORE_TRAINING_MODULES."}
                        </p>
                      </div>

                      <button onClick={handleNextLocation} className="pixel-button w-full flex items-center justify-center gap-2">
                        NEXT_LOCATION
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(baseUrl, model) => {
          setSettings({ baseUrl, model });
          setShowSettings(false);
        }}
        initialBaseUrl={settings.baseUrl}
        initialModel={settings.model}
      />

      {/* Footer Info */}
      <footer className="mt-4 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-[#444]">
          <Info size={14} />
          <span className="pixel-text text-[8px]">V0.1.0_BETA_BUILD</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff00]" />
            <span className="pixel-text text-[8px] text-[#00ff00]">AGENT_ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff4e00]" />
            <span className="pixel-text text-[8px] text-[#ff4e00]">SERVER_SYNCED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
