import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Volume2,
  Radio,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatbot: () => void;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onOpenChatbot
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcriptPreview, setTranscriptPreview] = useState<string>('Listening to your voice...');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Convert Float32 (mic audio) to 16-bit PCM little-endian
  const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const base64EncodeAudio = (arrayBuffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Stop active model audio when interrupted
  const stopAllModelAudio = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  };

  // Playback model 24kHz PCM chunks
  const playPcmChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
    }
    const ctx = outputAudioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    setConnectionState('speaking');

    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setConnectionState('listening');
        }
      };
    } catch (e) {
      console.error('Error decoding/playing PCM audio chunk:', e);
    }
  };

  const startLiveSession = async () => {
    try {
      setConnectionState('connecting');
      setErrorMessage(null);
      stopAllModelAudio();

      // Setup audio contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      outputAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      // Connect WebSocket to backend proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        setTranscriptPreview('Tara is listening! Speak in English or Bengali...');

        // Start processing mic input
        if (inputAudioCtxRef.current && mediaStreamRef.current) {
          const source = inputAudioCtxRef.current.createMediaStreamSource(mediaStreamRef.current);
          const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          source.connect(processor);
          processor.connect(inputAudioCtxRef.current.destination);

          processor.onaudioprocess = (e) => {
            if (isMuted) return;

            const inputData = e.inputBuffer.getChannelData(0);

            // Compute volume level for pulse visualizer
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setAudioLevel(Math.min(1, rms * 5));

            // Only stream if audio level is above gentle noise threshold or continuous
            if (ws.readyState === WebSocket.OPEN) {
              const pcmBuffer = floatTo16BitPCM(inputData);
              const base64 = base64EncodeAudio(pcmBuffer);
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            playPcmChunk(msg.audio);
          }
          if (msg.interrupted) {
            stopAllModelAudio();
            setConnectionState('listening');
          }
          if (msg.error) {
            console.error('Server live error:', msg.error);
            setErrorMessage(msg.error);
            setConnectionState('error');
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket connection error:', e);
        setErrorMessage('Could not establish Live connection. You can use our Text & Voice Chatbot anytime!');
        setConnectionState('error');
      };

      ws.onclose = () => {
        if (connectionState !== 'error') {
          setConnectionState('idle');
        }
      };
    } catch (err: any) {
      console.error('Microphone or connection failure:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          : err.message || 'Failed to initialize live voice session'
      );
      setConnectionState('error');
    }
  };

  const endLiveSession = () => {
    stopAllModelAudio();

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setConnectionState('idle');
    setAudioLevel(0);
  };

  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      endLiveSession();
    }
    return () => {
      endLiveSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-label="Tara Gadgets BD Live Voice Assistant"
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar */}
        <div className="w-full flex items-center justify-between z-10 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  connectionState === 'speaking'
                    ? 'bg-amber-400'
                    : connectionState === 'connected' || connectionState === 'listening'
                    ? 'bg-emerald-400'
                    : 'bg-blue-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  connectionState === 'speaking'
                    ? 'bg-amber-400'
                    : connectionState === 'connected' || connectionState === 'listening'
                    ? 'bg-emerald-400'
                    : 'bg-blue-400'
                }`}
              />
            </span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Gemini 3.8 Live API
            </span>
          </div>

          <button
            onClick={() => {
              endLiveSession();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div className="text-center z-10 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Tara Live Voice</span>
            <Sparkles className="w-5 h-5 text-blue-400" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time bidirectional speech for Tara Gadgets BD
          </p>
        </div>

        {/* Central Audio Visualizer */}
        <div className="relative w-48 h-48 flex items-center justify-center my-4 z-10">
          {/* Animated pulsing outer rings */}
          <div
            className={`absolute inset-0 rounded-full transition-transform duration-150 ${
              connectionState === 'speaking'
                ? 'bg-blue-500/20 animate-pulse scale-125'
                : connectionState === 'listening'
                ? 'bg-blue-500/10'
                : 'bg-slate-800/40'
            }`}
            style={{
              transform: `scale(${1 + audioLevel * 0.4})`
            }}
          />
          <div
            className={`absolute inset-4 rounded-full transition-transform duration-100 ${
              connectionState === 'speaking'
                ? 'bg-blue-500/30'
                : connectionState === 'listening'
                ? 'bg-blue-500/20'
                : 'bg-slate-800/60'
            }`}
            style={{
              transform: `scale(${1 + audioLevel * 0.25})`
            }}
          />

          {/* Center Orb */}
          <div
            className={`w-28 h-28 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 relative ${
              connectionState === 'speaking'
                ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-blue-500/50'
                : connectionState === 'listening'
                ? 'bg-gradient-to-tr from-blue-700 to-indigo-800 shadow-blue-600/30'
                : connectionState === 'connecting'
                ? 'bg-slate-800 animate-pulse'
                : 'bg-slate-800'
            }`}
          >
            {connectionState === 'speaking' ? (
              <Volume2 className="w-12 h-12 text-white animate-bounce" />
            ) : isMuted ? (
              <MicOff className="w-12 h-12 text-rose-400" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </div>
        </div>

        {/* Status Label */}
        <div className="z-10 text-center my-4">
          <div className="text-sm font-semibold text-white">
            {connectionState === 'connecting' && 'Connecting to Gemini Live...'}
            {connectionState === 'speaking' && 'Tara is speaking...'}
            {connectionState === 'listening' && (isMuted ? 'Microphone is muted' : 'Listening... speak freely')}
            {connectionState === 'connected' && 'Session connected'}
            {connectionState === 'error' && 'Connection Issue'}
            {connectionState === 'idle' && 'Session Idle'}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-sm px-4">
            {errorMessage ? (
              <span className="text-rose-400">{errorMessage}</span>
            ) : (
              transcriptPreview
            )}
          </p>
        </div>

        {/* Suggestion Prompts */}
        <div className="w-full z-10 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 my-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Try Asking Out Loud:
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <span className="text-[11px] bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded-full">
              "What earbuds do you recommend under ৳4,000?"
            </span>
            <span className="text-[11px] bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded-full">
              "Is Cash on Delivery available in Sylhet?"
            </span>
            <span className="text-[11px] bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded-full">
              "Tell me about your 7-day replacement warranty."
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-center gap-4 z-10 pt-2">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={() => {
              endLiveSession();
              onClose();
            }}
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>

          {/* Switch to Chatbot */}
          <button
            onClick={() => {
              endLiveSession();
              onClose();
              onOpenChatbot();
            }}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition-all cursor-pointer"
            title="Switch to Text Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
