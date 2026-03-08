import React, { useState } from "react";
import { Settings, X, Save, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (baseUrl: string, model: string) => void;
  initialBaseUrl: string;
  initialModel: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBaseUrl,
  initialModel,
}) => {
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [model, setModel] = useState(initialModel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="pixel-card w-full max-w-md bg-[#2a2a2a] relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-4">
          <Settings size={24} className="text-[#00ff00]" />
          <h2 className="pixel-title text-[18px]">AGENT_SETTINGS</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="pixel-text text-[10px] text-[#888] block">LM_STUDIO_BASE_URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-black border-2 border-[#444] p-3 font-mono text-[12px] text-[#00ff00] focus:border-[#00ff00] outline-none"
              placeholder="http://localhost:1234/v1"
            />
          </div>

          <div className="space-y-2">
            <label className="pixel-text text-[10px] text-[#888] block">MODEL_NAME</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-black border-2 border-[#444] p-3 font-mono text-[12px] text-[#00ff00] focus:border-[#00ff00] outline-none"
              placeholder="qwen2.5vl:7b"
            />
          </div>

          <div className="pixel-card bg-black/50 border-[#444] p-3 space-y-2">
            <p className="pixel-text text-[8px] text-[#888] leading-relaxed">
              * Ensure LM Studio is running and API server is enabled.
              <br />
              * CORS must be allowed in LM Studio settings.
              <br />
              * Vision models (like Qwen2.5-VL) are required for image analysis.
            </p>
          </div>

          <button
            onClick={() => onSave(baseUrl, model)}
            className="pixel-button w-full flex items-center justify-center gap-2"
          >
            <Save size={16} />
            SAVE_CONFIG
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
