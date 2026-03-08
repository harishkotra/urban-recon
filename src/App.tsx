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

const App: React.FC = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "results">("start");
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [agentGuess, setAgentGuess] = useState<AgentGuess | null>(null);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    baseUrl: "http://localhost:1234/v1",
    model: "qwen2.5vl:7b"
  });

  const currentLocation = locations[currentLocationIndex];

  const handleStartGame = () => {
    setGameState("playing");
    setUserGuess(null);
    setAgentGuess(null);
    setAgentError(null);
  };

  const handleUserGuess = (lat: number, lng: number) => {
    setUserGuess({ lat, lng });
  };

  const handleAgentSolve = async () => {
    if (isAgentThinking) return;
    setIsAgentThinking(true);
    setAgentError(null);
    try {
      const result = await solveLocation(
        currentLocation.imageUrl,
        settings.baseUrl,
        settings.model
      );
      setAgentGuess(result);
    } catch (err: any) {
      setAgentError(err.message || "Failed to connect to agent");
    } finally {
      setIsAgentThinking(false);
    }
  };

  const handleSubmitGuess = () => {
    if (!userGuess) return;
    setGameState("results");
    if (!agentGuess) {
      handleAgentSolve();
    }
  };

  const handleNextLocation = () => {
    const nextIndex = (currentLocationIndex + 1) % locations.length;
    setCurrentLocationIndex(nextIndex);
    setGameState("playing");
    setUserGuess(null);
    setAgentGuess(null);
    setAgentError(null);
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

  const userDistance = userGuess ? calculateDistance(userGuess.lat, userGuess.lng, currentLocation.lat, currentLocation.lng) : null;
  const agentDistance = agentGuess ? calculateDistance(agentGuess.lat, agentGuess.lng, currentLocation.lat, currentLocation.lng) : null;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col p-4 md:p-8 overflow-hidden relative">
      {/* Background Scanlines */}
      <div className="fixed inset-0 pixel-scanline pointer-events-none z-50 opacity-30" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-4">
          <div className="pixel-card bg-[#00ff00] p-2">
            <MapPin size={24} className="text-black" />
          </div>
          <div>
            <h1 className="pixel-title text-[20px] md:text-[28px]">PIXEL_GEOAGENT</h1>
            <p className="pixel-text text-[10px] text-[#888]">QWEN-2.5-VL POWERED GEOGUESSER</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="pixel-button bg-[#333] hover:bg-[#444]"
        >
          <SettingsIcon size={16} />
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-6 relative z-10">
        <AnimatePresence mode="wait">
          {gameState === "start" ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-8"
            >
              <div className="pixel-card max-w-2xl bg-black/40 backdrop-blur-md p-12 space-y-8">
                <div className="flex justify-center gap-4">
                  <Cpu size={64} className="text-[#00ff00] animate-pulse" />
                  <Zap size={64} className="text-[#ff4e00] animate-bounce" />
                </div>
                <h2 className="pixel-title text-[32px]">READY_TO_PLAY?</h2>
                <p className="pixel-text text-[#888] leading-relaxed">
                  Test your geographic knowledge against the Qwen-2.5-VL agent.
                  Explore locations, make your guess, and see if the AI can beat you.
                </p>
                <div className="pixel-card bg-black/20 border-[#333] p-4 text-left space-y-2">
                  <p className="pixel-text text-[8px] text-[#00ff00]">SETUP_INSTRUCTIONS:</p>
                  <p className="pixel-text text-[8px] text-[#666]">1. RUN LM STUDIO ON YOUR MACHINE</p>
                  <p className="pixel-text text-[8px] text-[#666]">2. LOAD QWEN2.5-VL-7B (OR SIMILAR VISION MODEL)</p>
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
              className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Image and Agent Terminal */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="pixel-card flex-1 relative overflow-hidden bg-black group">
                  <img
                    src={currentLocation.imageUrl}
                    alt="Location"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {currentLocation.hints.map((hint, i) => (
                      <div key={i} className="pixel-card bg-black/60 p-2 text-[8px] pixel-text text-[#00ff00]">
                        HINT_{i+1}: {hint}
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="pixel-card bg-black/60 p-2 text-[10px] pixel-text text-[#ff4e00]">
                      LOCATION_ID: {currentLocation.id}
                    </div>
                  </div>
                </div>

                <div className="h-[200px] md:h-[250px]">
                  <AgentTerminal
                    isThinking={isAgentThinking}
                    agentGuess={agentGuess || undefined}
                    error={agentError || undefined}
                  />
                </div>
              </div>

              {/* Right Column: Map and Controls */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="h-[300px] lg:flex-1 relative">
                  <PixelMap
                    onGuess={handleUserGuess}
                    actualLocation={gameState === "results" ? currentLocation : undefined}
                    agentGuess={agentGuess || undefined}
                    userGuess={userGuess || undefined}
                    showResults={gameState === "results"}
                  />
                  {!userGuess && gameState === "playing" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="pixel-card bg-black/80 p-4 text-center">
                        <p className="pixel-text text-[10px] text-[#00ff00]">CLICK_MAP_TO_GUESS</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pixel-card space-y-4">
                  {gameState === "playing" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="pixel-text text-[10px] text-[#888]">USER_STATUS:</span>
                        <span className={`pixel-text text-[10px] ${userGuess ? "text-[#00ff00]" : "text-red-500"}`}>
                          {userGuess ? "GUESS_LOCKED" : "WAITING_FOR_INPUT"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitGuess}
                          disabled={!userGuess}
                          className={`pixel-button flex-1 ${!userGuess ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          SUBMIT_GUESS
                        </button>
                        <button
                          onClick={handleAgentSolve}
                          disabled={isAgentThinking}
                          className="pixel-button bg-[#333] flex items-center justify-center"
                          title="Ask Agent to Solve"
                        >
                          <Cpu size={16} className={isAgentThinking ? "animate-spin" : ""} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="pixel-card bg-black/40 p-3 space-y-2">
                          <p className="pixel-text text-[8px] text-[#888]">USER_DISTANCE</p>
                          <p className="pixel-text text-[14px] text-blue-400">
                            {userDistance?.toFixed(1)} KM
                          </p>
                        </div>
                        <div className="pixel-card bg-black/40 p-3 space-y-2">
                          <p className="pixel-text text-[8px] text-[#888]">AGENT_DISTANCE</p>
                          <p className="pixel-text text-[14px] text-red-400">
                            {agentDistance ? `${agentDistance.toFixed(1)} KM` : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="pixel-card bg-[#00ff00]/10 border-[#00ff00]/30 p-4 text-center">
                        <h3 className="pixel-text text-[#00ff00] mb-2">RESULT:</h3>
                        <p className="pixel-text text-[10px] text-white">
                          {agentDistance && userDistance && agentDistance < userDistance 
                            ? "AGENT_WINS!_BETTER_LUCK_NEXT_TIME." 
                            : "USER_WINS!_HUMANITY_PREVAILS."}
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
      <footer className="mt-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-[#444]">
          <Info size={14} />
          <span className="pixel-text text-[8px]">V0.1.0_BETA_BUILD</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff00] animate-pulse" />
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
