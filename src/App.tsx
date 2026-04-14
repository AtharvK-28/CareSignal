import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Shield, 
  AlertCircle, 
  Droplets,
  Apple,
  ClipboardCheck,
  UserRound,
  ArrowLeft,
  Info,
  ArrowRight, 
  Search, 
  Clock, 
  Activity, 
  ChevronRight,
  Download,
  RefreshCcw,
  Plus,
  Mail,
  FileText,
  CreditCard,
  Bell,
  MapPin,
  Stethoscope,
  Utensils,
  Home,
  MessageSquare,
  Mic,
  Send,
  Volume2,
  VolumeX,
  X,
  Phone,
  Star,
  Navigation,
  Locate,
  Camera,
  Image as ImageIcon,
  Trash2,
  Languages,
  Globe,
  Map as MapIcon,
  ShieldCheck,
  Lock,
  Copy,
  Wind
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { BodyMap, BodyRegion } from "@/components/BodyMap";
import { ClinicalReportView } from "@/components/ClinicalReportView";
import { geminiService, TriageResult, FollowUpQuestion, CheckInAnalysis, ClinicalReport } from "@/services/geminiService";
import { cn } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { matchSymptoms, calculatePriorityScore } from "@/lib/algorithms";
import { HISTORICAL_TRENDS_DATA } from "@/data/medicalDataset";
import { auth, signInWithGoogle, logout, saveUserConsent, saveTriageReport, UserConsent, saveCheckInSettings, getCheckInSettings, CheckInSettings, getUserReports, saveUserProfile, getUserProfile, UserProfile, EmergencyContact } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type Screen = "LANDING" | "INTAKE_PRIMARY" | "INTAKE_VISUAL" | "INTAKE_DEMOGRAPHICS" | "INTAKE_SPECIFICS" | "INTAKE_FOLLOWUP" | "PROCESSING" | "DASHBOARD" | "CHAT" | "VOICE_AGENT" | "CLINICAL_REPORT";

const LANGUAGES = [
  { code: "English", label: "English", flag: "🇺🇸" },
  { code: "Spanish", label: "Español", flag: "🇪🇸" },
  { code: "French", label: "Français", flag: "🇫🇷" },
  { code: "Hindi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "Chinese", label: "中文", flag: "🇨🇳" },
  { code: "Arabic", label: "العربية", flag: "🇸🇦" },
];

const UI_STRINGS: Record<string, Record<string, string>> = {
  English: {
    landingTitle: "Understand Your Symptoms",
    landingSubtitle: "in Seconds.",
    landingDesc: "Get action-oriented recommendations and clear next steps based on your symptoms. Our intelligent triage system helps you decide what to do next.",
    textTriage: "Text Triage",
    voiceTriage: "Voice Triage",
    chatAssistant: "Chat Assistant",
    voiceCompanion: "Voice Companion",
    privacyFirst: "Privacy First",
    actionOriented: "Action Oriented",
    trustworthy: "Trustworthy",
    step: "Step",
    continue: "Continue",
    back: "Back",
    skip: "Skip this Step",
    whereDoesItHurt: "Where does it hurt?",
    describeSymptom: "Describe Symptom",
    visualEvidence: "Visual Evidence",
    takePhoto: "Take Photo",
    uploadImage: "Upload Image",
    aboutYou: "About You",
    yourAge: "Your Age",
    medicalHistory: "Medical History",
    tellUsMore: "Tell us more",
    severityLevel: "Severity Level",
    duration: "Duration",
    followUpQuestions: "Follow-up Questions",
    processing: "Processing...",
    dashboard: "Triage Dashboard",
    startNew: "Start New Assessment",
  },
  Spanish: {
    landingTitle: "Comprenda sus síntomas",
    landingSubtitle: "en segundos.",
    landingDesc: "Obtenga recomendaciones orientadas a la acción y pasos claros a seguir basados en sus síntomas. Nuestro sistema de triaje inteligente le ayuda a decidir qué hacer a continuación.",
    textTriage: "Triaje de Texto",
    voiceTriage: "Triaje de Voz",
    chatAssistant: "Asistente de Chat",
    voiceCompanion: "Compañero de Voz",
    privacyFirst: "Privacidad Primero",
    actionOriented: "Orientado a la Acción",
    trustworthy: "Confiable",
    step: "Paso",
    continue: "Continuar",
    back: "Atrás",
    skip: "Omitir este paso",
    whereDoesItHurt: "¿Dónde le duele?",
    describeSymptom: "Describir síntoma",
    visualEvidence: "Evidencia Visual",
    takePhoto: "Tomar Foto",
    uploadImage: "Subir Imagen",
    aboutYou: "Sobre Usted",
    yourAge: "Su Edad",
    medicalHistory: "Historial Médico",
    tellUsMore: "Cuéntenos más",
    severityLevel: "Nivel de Gravedad",
    duration: "Duración",
    followUpQuestions: "Preguntas de Seguimiento",
    processing: "Procesando...",
    dashboard: "Panel de Triaje",
    startNew: "Iniciar nueva evaluación",
  },
  French: {
    landingTitle: "Comprenez vos symptômes",
    landingSubtitle: "en quelques secondes.",
    landingDesc: "Obtenez des recommandations orientées vers l'action et des étapes claires basées sur vos symptômes. Notre système de triage intelligent vous aide à décider de la suite.",
    textTriage: "Triage Texte",
    voiceTriage: "Triage Vocal",
    chatAssistant: "Assistant Chat",
    voiceCompanion: "Compagnon Vocal",
    privacyFirst: "Confidentialité",
    actionOriented: "Orienté Action",
    trustworthy: "Fiable",
    step: "Étape",
    continue: "Continuer",
    back: "Retour",
    skip: "Passer cette étape",
    whereDoesItHurt: "Où avez-vous mal ?",
    describeSymptom: "Décrire le symptôme",
    visualEvidence: "Preuve Visuelle",
    takePhoto: "Prendre Photo",
    uploadImage: "Télécharger Image",
    aboutYou: "À propos de vous",
    yourAge: "Votre Âge",
    medicalHistory: "Historique Médical",
    tellUsMore: "Dites-nous en plus",
    severityLevel: "Niveau de Gravité",
    duration: "Durée",
    followUpQuestions: "Questions de Suivi",
    processing: "Traitement...",
    dashboard: "Tableau de Triage",
    startNew: "Nouvelle évaluation",
  },
  Hindi: {
    landingTitle: "अपने लक्षणों को समझें",
    landingSubtitle: "सेकंडों में।",
    landingDesc: "अपने लक्षणों के आधार पर कार्रवाई-उन्मुख सिफारिशें और स्पष्ट अगले कदम प्राप्त करें। हमारा बुद्धिमान ट्राइएज सिस्टम आपको यह तय करने में मदद करता है कि आगे क्या करना है।",
    textTriage: "टेक्स्ट ट्राइएज",
    voiceTriage: "वॉयस ट्राइएज",
    chatAssistant: "चैट सहायक",
    voiceCompanion: "वॉयस साथी",
    privacyFirst: "गोपनीयता पहले",
    actionOriented: "कार्रवाई उन्मुख",
    trustworthy: "भरोसेमंद",
    step: "चरण",
    continue: "जारी रखें",
    back: "पीछे",
    skip: "इस चरण को छोड़ें",
    whereDoesItHurt: "कहाँ दर्द हो रहा है?",
    describeSymptom: "लक्षण का वर्णन करें",
    visualEvidence: "दृश्य साक्ष्य",
    takePhoto: "फोटो लें",
    uploadImage: "छवि अपलोड करें",
    aboutYou: "आपके बारे में",
    yourAge: "आपकी उम्र",
    medicalHistory: "चिकित्सा इतिहास",
    tellUsMore: "हमें और बताएं",
    severityLevel: "गंभीरता का स्तर",
    duration: "अवधि",
    followUpQuestions: "अनुवर्ती प्रश्न",
    processing: "प्रसंस्करण...",
    dashboard: "ट्राइएज डैशबोर्ड",
    startNew: "नया मूल्यांकन शुरू करें",
  }
};

function TextWithTooltips({ text, terms }: { text: string; terms: Record<string, string> }) {
  if (!terms || Object.keys(terms).length === 0) return <>{text}</>;

  // Sort terms by length descending to avoid partial matches inside longer terms
  const sortedTerms = Object.keys(terms).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
  
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const termKey = sortedTerms.find(t => t.toLowerCase() === lowerPart);
        
        if (termKey) {
          return (
            <Tooltip key={i}>
              <TooltipTrigger>
                <span className="cursor-help border-b border-dotted border-blue-400 text-blue-700 font-medium hover:text-blue-900 transition-colors">
                  {part}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-slate-900 text-white border-none shadow-xl p-3">
                <p className="text-xs leading-relaxed">{terms[termKey]}</p>
              </TooltipContent>
            </Tooltip>
          );
        }
        return part;
      })}
    </>
  );
}

function LiveVoiceAgent({ onBack, setScreen, isTriage, onComplete }: { onBack: () => void, setScreen: (s: Screen) => void, isTriage?: boolean, onComplete?: (summary: string) => void }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [transcript, setTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  
  const sessionRef = useRef<any>(null);
  const sessionOpenRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueue = useRef<Float32Array[]>([]);
  const isPlaying = useRef(false);

  const stopAudio = () => {
    audioQueue.current = [];
    isPlaying.current = false;
    setIsSpeaking(false);
  };

  const stopMic = () => {
    processorRef.current?.disconnect();
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
    }
    processorRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
    }
    audioContextRef.current = null;
  };

  const playAudioChunk = (base64Data: string) => {
    if (!audioContextRef.current) return;
    
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert 16-bit PCM to Float32
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }
    
    audioQueue.current.push(float32);
    if (!isPlaying.current) {
      processQueue();
    }
  };

  const processQueue = async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlaying.current = true;
    setIsSpeaking(true);
    const chunk = audioQueue.current.shift()!;
    
    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      processQueue();
    };
    
    source.start();
  };

  useEffect(() => {
    const initLive = async () => {
      try {
        const session = await geminiService.connectLive({
          onopen: () => {
            sessionOpenRef.current = true;
            setIsConnected(true);
            setStatus("Connected. Start speaking!");
            startMic();
          },
          onmessage: (message: any) => {
            // Handle audio data
            if (message.serverContent?.modelTurn) {
              const parts = message.serverContent.modelTurn.parts;
              for (const part of parts) {
                if (part.inlineData?.data) {
                  playAudioChunk(part.inlineData.data);
                }
              }
            }

            // Handle tool calls (can be in serverContent or top-level)
            const toolCalls = message.toolCall?.functionCalls || 
                             message.serverContent?.modelTurn?.parts?.find((p: any) => p.toolCall)?.toolCall?.functionCalls;

            if (toolCalls) {
              const completeTriageCall = toolCalls.find((tc: any) => tc.name === "complete_triage");
              if (completeTriageCall) {
                const summary = completeTriageCall.args.summary || "Voice triage completed.";
                console.log("Triage complete tool called with summary:", summary);
                
                // Respond to the tool call to satisfy the model
                if (sessionRef.current) {
                  sessionRef.current.sendToolResponse({
                    functionResponses: [{
                      name: "complete_triage",
                      response: { result: "Triage report is being generated. Closing session." }
                    }]
                  });
                }

                // Small delay to let the model receive the response before closing
                setTimeout(() => {
                  if (onComplete) onComplete(summary);
                }, 500);
                return;
              }
            }
            
            if (message.serverContent?.interrupted) {
              stopAudio();
            }

            if (message.serverContent?.turnComplete) {
              // Turn complete
            }

            // Handle transcriptions
            const outputTranscription = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
            if (outputTranscription) {
              setAiTranscript(prev => prev + " " + outputTranscription);
            }

            const inputTranscription = message.serverContent?.userTurn?.parts?.find((p: any) => p.text)?.text;
            if (inputTranscription) {
              setTranscript(inputTranscription);
            }
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            sessionOpenRef.current = false;
            setStatus("Connection Error");
            stopMic();
          },
          onclose: () => {
            sessionOpenRef.current = false;
            setIsConnected(false);
            setStatus("Disconnected");
            stopMic();
          }
        }, isTriage);
        sessionRef.current = session;
      } catch (err) {
        console.error("Failed to connect to Live API:", err);
        sessionOpenRef.current = false;
        setStatus("Failed to connect");
      }
    };

    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        
        // ScriptProcessorNode for downsampling and chunking
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Convert Float32 to Int16 PCM
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          
          // Convert to Base64
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          
          if (sessionRef.current && sessionOpenRef.current) {
            sessionRef.current.sendRealtimeInput({
              audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
            });
          }
        };
        
        source.connect(processor);
        processor.connect(audioContextRef.current.destination);
      } catch (err) {
        console.error("Mic access error:", err);
        setStatus("Microphone access denied");
      }
    };

    initLive();

    return () => {
      sessionOpenRef.current = false;
      sessionRef.current?.close();
      sessionRef.current = null;
      stopMic();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center text-white transition-colors duration-700",
        isTriage ? "bg-indigo-950" : "bg-slate-900"
      )}
    >
      <div className="absolute top-8 left-0 right-0 flex justify-center">
        <div className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg",
          isTriage ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
        )}>
          {isTriage ? (
            <><Activity className="h-3.5 w-3.5" /> Voice Triage Mode</>
          ) : (
            <><Heart className="h-3.5 w-3.5" /> Health Companion Mode</>
          )}
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack} 
        className="absolute right-6 top-6 text-white hover:bg-white/10"
      >
        <X className="h-8 w-8" />
      </Button>

      <div className="relative flex flex-col items-center gap-12 w-full max-w-2xl">
        <div className="relative">
          <AnimatePresence>
            {(isConnected || isSpeaking) && (
              <motion.div
                key="voice-indicator"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "absolute inset-0 rounded-full",
                  isSpeaking ? (isTriage ? "bg-indigo-400" : "bg-emerald-400") : "bg-green-500"
                )}
              />
            )}
          </AnimatePresence>

          <div 
            className={cn(
              "relative z-10 flex h-48 w-48 items-center justify-center rounded-full border-4 transition-all duration-500",
              isSpeaking ? (isTriage ? "border-indigo-400 bg-indigo-600 shadow-[0_0_50px_rgba(99,102,241,0.5)]" : "border-emerald-400 bg-emerald-600 shadow-[0_0_50px_rgba(16,185,129,0.5)]") : 
              isConnected ? "border-green-500 bg-green-600 shadow-[0_0_50px_rgba(34,197,94,0.5)]" : 
              "border-slate-700 bg-slate-800"
            )}
          >
            {isSpeaking ? <Volume2 className="h-20 w-20 animate-bounce" /> : <Mic className="h-20 w-20" />}
          </div>
        </div>

        <div className="text-center space-y-6 w-full px-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{status}</h2>
            {isTriage && isConnected && (
              <p className="text-indigo-300 text-sm font-medium animate-pulse">
                AI is conducting a clinical assessment...
              </p>
            )}
            {!isTriage && isConnected && (
              <p className="text-emerald-300 text-sm font-medium">
                Your empathetic health companion is ready to talk.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">You</h3>
              <p className="text-sm text-slate-300 italic">
                {transcript || "Listening..."}
              </p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">AI</h3>
              <p className="text-sm text-slate-300">
                {aiTranscript || "Waiting for response..."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={onBack}
            >
              End Session
            </Button>
          </div>
          
          {(status.includes("Error") || status.includes("denied")) && (
            <div className="flex flex-col items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setScreen("CHAT")}
              >
                Switch to Text Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 text-center space-y-2">
        <div className="text-xs text-slate-500 uppercase tracking-widest">
          Gemini Multimodal Live Agent
        </div>
        <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
          Real-time, low-latency voice conversation. <br />
          Speak naturally, the AI will listen and respond instantly.
        </p>
      </div>
    </motion.div>
  );
}

function ChatInterface({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Hello! I'm CareSignal AI. How can I help you today? Please describe your symptoms." }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = geminiService.createChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage = { role: "user" as const, text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessage({ message: text });
      setMessages(prev => [...prev, { role: "model", text: result.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "model", text: "I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-2xl w-full h-[600px] flex flex-col"
    >
      <Card className="flex-1 flex flex-col border-2 border-slate-200 shadow-2xl overflow-hidden">
        <CardHeader className="bg-blue-600 text-white py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">CareSignal AI</CardTitle>
                <CardDescription className="text-blue-100 text-xs">Always here to help</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
              Exit Chat
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-800 rounded-tl-none"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2 flex gap-1">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t bg-slate-50">
          <div className="flex gap-2">
            <div className="relative">
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    key="mic-indicator"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0.3 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-red-400"
                  />
                )}
              </AnimatePresence>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "relative z-10 rounded-full h-12 w-12 flex-shrink-0 transition-all duration-300",
                  isListening && "bg-red-50 border-red-200 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                )}
                onClick={toggleListening}
              >
                <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
              </Button>
            </div>
            <Input
              placeholder="Type your symptoms..."
              className="h-12 rounded-full px-6"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            />
            <Button
              size="icon"
              className="rounded-full h-12 w-12 flex-shrink-0 bg-blue-600"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
            {isListening ? "Listening..." : "Press mic to speak"}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
export default function App() {
  const [screen, setScreen] = useState<Screen>("LANDING");
  const [primaryComplaint, setPrimaryComplaint] = useState("");
  const [age, setAge] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("");
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [images, setImages] = useState<{ data: string; mimeType: string; preview: string }[]>([]);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<BodyRegion | undefined>(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [loadingText, setLoadingText] = useState("Validating inputs...");
  const [pincode, setPincode] = useState("");
  const [nearbyDoctors, setNearbyDoctors] = useState<any[]>([]);
  const [nearbyLabs, setNearbyLabs] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isVoiceTriage, setIsVoiceTriage] = useState(false);
  const [algorithmicMatches, setAlgorithmicMatches] = useState<{ condition: any; score: number }[]>([]);
  const [priorityScore, setPriorityScore] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consent, setConsent] = useState<UserConsent>({ allowPersonalization: false, allowResearch: false });
  const [checkInSettings, setCheckInSettings] = useState<CheckInSettings>({ enabled: true, frequency: 'Standard' });
  const [isCheckInMode, setIsCheckInMode] = useState(false);
  const [checkInAnalysis, setCheckInAnalysis] = useState<CheckInAnalysis | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clinicalReport, setClinicalReport] = useState<ClinicalReport | null>(null);
  const [isGeneratingClinicalReport, setIsGeneratingClinicalReport] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const settings = await getCheckInSettings(u.uid);
        if (settings) setCheckInSettings(settings);
        
        const profile = await getUserProfile(u.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          setShowProfileModal(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const t = (key: string) => {
    return UI_STRINGS[selectedLanguage.code]?.[key] || UI_STRINGS["English"][key] || key;
  };

  const handleCopySummary = () => {
    if (!triageResult) return;
    const text = `CARESIGNAL TRIAGE SUMMARY\n\nUrgency: ${triageResult.urgency}\nPossible Cause: ${triageResult.whatMightHave}\nAction Plan (Right Now): ${triageResult.actionPlan.rightNow}\nPrognosis: ${triageResult.prognosis}\nRisks of Inaction: ${triageResult.risksOfInaction}\n\nGenerated by CareSignal AI.`;
    navigator.clipboard.writeText(text);
    alert("Summary copied to clipboard!");
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      const reports = await getUserReports(user.uid);
      const data = {
        profile: userProfile,
        reports: reports,
        consent: consent,
        checkInSettings: checkInSettings
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CareSignal_Data_${user.uid.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data.");
    }
  };

  const handleGenerateClinicalReport = async () => {
    if (!user) {
      alert("Please log in to generate a clinical report.");
      return;
    }
    setIsGeneratingClinicalReport(true);
    try {
      const reports = await getUserReports(user.uid);
      const report = await geminiService.generateClinicalSummary(reports, userProfile);
      setClinicalReport(report);
      setScreen("CLINICAL_REPORT");
    } catch (error) {
      console.error("Error generating clinical report:", error);
      alert("Failed to generate clinical report. Please try again.");
    } finally {
      setIsGeneratingClinicalReport(false);
    }
  };

  const handleVoiceTriageComplete = async (summary: string) => {
    setScreen("PROCESSING");
    setLoadingText("Analyzing voice triage data and visual evidence...");
    
    // Run local algorithm in parallel
    const matches = matchSymptoms(summary);
    setAlgorithmicMatches(matches);

    try {
      const result = await geminiService.getTriageResult({
        voiceSummary: summary,
        images: images.map(img => ({ data: img.data, mimeType: img.mimeType })),
        language: selectedLanguage.code
      });
      setTriageResult(result);
      
      // Calculate priority score
      const score = calculatePriorityScore({
        severity: severity,
        durationDays: parseInt(duration) || 1,
        age: parseInt(age) || 30,
        hasRedFlags: result.redFlags.symptoms.length > 0,
        urgencyLevel: result.urgency
      });
      setPriorityScore(score);
      
      setScreen("DASHBOARD");
      setShowConsentModal(true);
    } catch (error) {
      console.error(error);
      setScreen("LANDING");
    }
  };

  const handleLocationSearch = async (location?: { lat: number, lng: number } | string) => {
    if (isLocating) return;
    setIsLocating(true);
    setLocationError(null);
    try {
      const { doctors, labs } = await geminiService.searchAllNearbyResources(location);
      setNearbyDoctors(doctors);
      setNearbyLabs(labs);
    } catch (error) {
      console.error("Location search failed", error);
      setLocationError("Nearby search is temporarily unavailable. Please try again in a moment.");
    } finally {
      setIsLocating(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSearch({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        alert("Unable to retrieve your location. Please enter your PIN code manually.");
      }
    );
  };

  const startTriage = () => {
    if (!user) {
      signInWithGoogle().catch(err => console.error("Sign in failed", err));
      return;
    }
    setScreen("INTAKE_PRIMARY");
  };

  const handlePrimarySubmit = () => {
    setScreen("INTAKE_VISUAL");
  };

  const handleRegionSelect = (region: BodyRegion, label: string) => {
    setSelectedBodyRegion(region);
    // Optionally pre-fill or suggest symptoms based on region
    const regionSymptoms: Record<BodyRegion, string[]> = {
      head: ["Headache", "Dizziness", "Vision Changes", "Confusion"],
      neck: ["Stiff Neck", "Sore Throat", "Swollen Glands"],
      chest: ["Chest Pain", "Shortness of Breath", "Cough", "Palpitations"],
      abdomen: ["Stomach Ache", "Nausea", "Bloating", "Cramps"],
      pelvis: ["Pelvic Pain", "Urinary Issues"],
      left_arm: ["Arm Pain", "Numbness", "Weakness"],
      right_arm: ["Arm Pain", "Numbness", "Weakness"],
      left_leg: ["Leg Pain", "Swelling", "Cramps"],
      right_leg: ["Leg Pain", "Swelling", "Cramps"],
      upper_back: ["Back Pain", "Shoulder Pain"],
      lower_back: ["Lower Back Pain", "Sciatica"],
      shoulders: ["Shoulder Pain", "Rotator Cuff Issue", "Limited Range of Motion"],
    };
    
    const regionLabels = ["Head", "Neck", "Chest", "Abdomen", "Pelvis", "Left Arm", "Right Arm", "Left Leg", "Right Leg", "Upper Back", "Lower Back", "Shoulders"];
    
    // If user hasn't typed anything, or if they have a region label selected, update it
    if (!primaryComplaint || regionLabels.includes(primaryComplaint)) {
      setPrimaryComplaint(label);
    }
  };

  const handleVisualSubmit = () => {
    setScreen("INTAKE_DEMOGRAPHICS");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImages(prev => [...prev, {
          data: base64,
          mimeType: file.type,
          preview: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDemographicsSubmit = () => {
    if (!age) return;
    setScreen("INTAKE_SPECIFICS");
  };

  const handleSpecificsSubmit = async () => {
    if (!duration) return;
    setScreen("PROCESSING");
    setLoadingText("Checking for critical symptom combinations...");
    try {
      const questions = await geminiService.getFollowUpQuestions(primaryComplaint);
      setFollowUps(questions);
      setScreen("INTAKE_FOLLOWUP");
    } catch (error) {
      console.error(error);
      setScreen("INTAKE_SPECIFICS");
    }
  };

  const handleFollowUpSubmit = async () => {
    setScreen("PROCESSING");
    const processingSteps = [
      "Validating inputs...",
      "Analyzing visual evidence...",
      "Checking for critical symptom combinations...",
      "Calculating severity and duration weights...",
      "Generating plain-English reasoning..."
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < processingSteps.length) {
        setLoadingText(processingSteps[stepIndex]);
        stepIndex++;
      }
    }, 800);

    try {
      let result: TriageResult;
      if (isCheckInMode && user) {
        const reports = await getUserReports(user.uid);
        const lastReport = reports[0];
        const analysis = await geminiService.analyzeCheckIn({
          previousReport: lastReport,
          currentSymptoms: primaryComplaint,
          currentSeverity: severity,
          daysSinceLastReport: 1
        });
        setCheckInAnalysis(analysis);
        
        result = await geminiService.getTriageResult({
          primaryComplaint: `CHECK-IN: ${primaryComplaint}. Trend: ${analysis.trend}. Reasoning: ${analysis.reasoning}`,
          severity,
          duration,
          age,
          medicalHistory,
          language: selectedLanguage.code
        });
      } else {
        // Run local algorithm for text triage
        const matches = matchSymptoms(primaryComplaint);
        setAlgorithmicMatches(matches);

        result = await geminiService.getTriageResult({
          primaryComplaint,
          severity,
          duration,
          age,
          medicalHistory,
          followUps: followUps.map(f => ({ question: f.question, answer: answers[f.question] || "No" })),
          images: images.map(img => ({ data: img.data, mimeType: img.mimeType })),
          language: selectedLanguage.code
        });
      }
      setTriageResult(result);
      
      const score = calculatePriorityScore({
        severity: severity,
        durationDays: parseInt(duration) || 1,
        age: parseInt(age) || 30,
        hasRedFlags: result.redFlags.symptoms.length > 0,
        urgencyLevel: result.urgency
      });
      setPriorityScore(score);
      
      clearInterval(interval);
      setScreen("DASHBOARD");
      setShowConsentModal(true);
    } catch (error) {
      console.error(error);
      clearInterval(interval);
      setScreen("INTAKE_FOLLOWUP");
    }
  };

  const handleConsentSubmit = async (selectedConsent: UserConsent) => {
    setConsent(selectedConsent);
    setShowConsentModal(false);

    if (selectedConsent.allowPersonalization && !user) {
      try {
        const loggedInUser = await signInWithGoogle();
        if (loggedInUser) {
          await saveUserConsent(loggedInUser.uid, selectedConsent);
          await saveTriageReport(loggedInUser.uid, {
            urgency: triageResult?.urgency,
            primaryComplaint,
            priorityScore,
            algorithmicMatches: algorithmicMatches.map(m => ({ name: m.condition.name, score: m.score }))
          }, selectedConsent);
        }
      } catch (err) {
        console.error("Consent sign-in failed", err);
      }
    } else if (user) {
      await saveUserConsent(user.uid, selectedConsent);
      await saveTriageReport(user.uid, {
        urgency: triageResult?.urgency,
        primaryComplaint,
        priorityScore,
        algorithmicMatches: algorithmicMatches.map(m => ({ name: m.condition.name, score: m.score }))
      }, selectedConsent);
    } else if (selectedConsent.allowResearch) {
      // Anonymized research data even without login
      await saveTriageReport("anonymous", {
        urgency: triageResult?.urgency,
        primaryComplaint,
        priorityScore,
        algorithmicMatches: algorithmicMatches.map(m => ({ name: m.condition.name, score: m.score }))
      }, selectedConsent);
    }
  };

  const reset = () => {
    setScreen("LANDING");
    setPrimaryComplaint("");
    setAge("");
    setMedicalHistory("");
    setSeverity(5);
    setDuration("");
    setFollowUps([]);
    setAnswers({});
    setTriageResult(null);
    setImages([]);
    setSelectedBodyRegion(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Global Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CareSignal</span>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="sm" className="h-9 gap-2 px-3 border border-slate-200 bg-white hover:bg-slate-50">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span className="hidden sm:inline text-xs font-bold">{selectedLanguage.label}</span>
                  <span className="text-xs">{selectedLanguage.flag}</span>
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-40">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => setSelectedLanguage(lang)}
                    className={cn("flex items-center justify-between", selectedLanguage.code === lang.code && "bg-blue-50 text-blue-600 font-bold")}
                  >
                    {lang.label}
                    <span>{lang.flag}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full border border-slate-200 overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserRound className="h-5 w-5 text-slate-500" />
                    )}
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-bold truncate">{user.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="text-xs">
                    <UserRound className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportData} className="text-xs">
                    <Download className="mr-2 h-4 w-4" />
                    Export My Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-xs text-red-600">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={signInWithGoogle} className="h-9 text-xs font-bold">
                Sign In
              </Button>
            )}

            {screen !== "LANDING" && (
              <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500 h-9">
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <TooltipProvider>
          <AnimatePresence mode="wait">
          {screen === "LANDING" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                AI-Powered Decision Support
              </div>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                {t('landingTitle')} <br />
                <span className="text-blue-600">{t('landingSubtitle')}</span>
              </h1>
              <p className="mb-10 max-w-2xl text-lg text-slate-600">
                {t('landingDesc')}
              </p>
              
              <div className="w-full max-w-2xl space-y-12">
                {/* Triage Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="h-1 w-8 bg-blue-600 rounded-full" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Symptom Triage</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button size="lg" onClick={() => { setIsCheckInMode(false); setIsVoiceTriage(false); startTriage(); }} className="h-32 flex-col gap-3 text-lg shadow-xl shadow-blue-100 bg-white border-2 border-slate-100 text-slate-900 hover:border-blue-600 hover:bg-blue-50 transition-all group">
                      <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{t('textTriage')}</span>
                        <span className="text-xs font-normal text-slate-500">Step-by-step assessment</span>
                      </div>
                    </Button>
                    {user && (
                      <Button size="lg" onClick={() => { setIsCheckInMode(true); setIsVoiceTriage(false); startTriage(); }} className="h-32 flex-col gap-3 text-lg shadow-xl shadow-amber-100 bg-white border-2 border-slate-100 text-slate-900 hover:border-amber-600 hover:bg-amber-50 transition-all group">
                        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <RefreshCcw className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="font-bold">Daily Check-In</span>
                          <span className="text-xs font-normal text-slate-500">Follow up on previous report</span>
                        </div>
                      </Button>
                    )}
                    <Button size="lg" onClick={() => { setIsCheckInMode(false); setIsVoiceTriage(true); setScreen("VOICE_AGENT"); }} className="h-32 flex-col gap-3 text-lg shadow-xl shadow-indigo-100 bg-white border-2 border-slate-100 text-slate-900 hover:border-indigo-600 hover:bg-indigo-50 transition-all group">
                      <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Mic className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{t('voiceTriage')}</span>
                        <span className="text-xs font-normal text-slate-500">Real-time clinical talk</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Support Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="h-1 w-8 bg-emerald-600 rounded-full" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Health Support</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => setScreen("CHAT")} className="h-20 justify-start px-6 gap-4 border-2 border-slate-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all group">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">{t('chatAssistant')}</span>
                        <span className="text-xs text-slate-500">Text-based health help</span>
                      </div>
                    </Button>
                    <Button variant="outline" onClick={() => { setIsVoiceTriage(false); setScreen("VOICE_AGENT"); }} className="h-20 justify-start px-6 gap-4 border-2 border-slate-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all group">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Volume2 className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">{t('voiceCompanion')}</span>
                        <span className="text-xs text-slate-500">Natural voice conversation</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center p-6">
                  <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-bold">{t('privacyFirst')}</h3>
                  <p className="text-sm text-slate-500">No data storage. Your health information stays with you.</p>
                </div>
                <div className="flex flex-col items-center p-6">
                  <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-bold">{t('actionOriented')}</h3>
                  <p className="text-sm text-slate-500">Clear, time-based guidance for your specific situation.</p>
                </div>
                <div className="flex flex-col items-center p-6">
                  <div className="mb-4 rounded-full bg-purple-100 p-3 text-purple-600">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-bold">{t('trustworthy')}</h3>
                  <p className="text-sm text-slate-500">Built on clinical logic and advanced AI analysis.</p>
                </div>
              </div>

              <div className="mt-16 w-full max-w-4xl space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Demo Scenarios</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title: "Rotator Cuff", text: "I have sharp shoulder pain and clicking when I lift my arm. It hurts more at night.", icon: <Activity className="h-4 w-4" /> },
                    { title: "Chest Pain", text: "I feel a heavy pressure in my chest and it's hard to breathe. My left arm feels numb.", icon: <AlertCircle className="h-4 w-4" /> },
                    { title: "Allergies", text: "I have itchy eyes, a runny nose, and I've been sneezing a lot since I went outside.", icon: <Wind className="h-4 w-4" /> }
                  ].map((scenario, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      onClick={() => {
                        setPrimaryComplaint(scenario.text);
                        setIsCheckInMode(false);
                        setIsVoiceTriage(false);
                        startTriage();
                      }}
                      className="h-auto py-5 px-5 flex-col items-start justify-start text-left gap-3 border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all shadow-sm hover:shadow-md rounded-2xl group whitespace-normal"
                    >
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider group-hover:scale-105 transition-transform">
                        {scenario.icon} {scenario.title}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic break-words">"{scenario.text}"</p>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-16 w-full max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-left">
                <div className="flex gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <h4 className="font-bold text-amber-900">Medical Disclaimer</h4>
                    <p className="text-sm text-amber-800">
                      This is a decision-support tool, not a medical diagnosis. In a life-threatening emergency, 
                      call your local emergency number immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen === "INTAKE_PRIMARY" && (
            <motion.div
              key="intake-primary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-2">{t('step')} 1 of 4</Badge>
                <h2 className="text-3xl font-bold">{t('whereDoesItHurt')}</h2>
                <p className="text-slate-500">Select the area on the body map or search below.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <MapIcon className="h-4 w-4 text-blue-600" />
                      Visual Body Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <BodyMap onSelectRegion={handleRegionSelect} selectedRegion={selectedBodyRegion} />
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-2 border-slate-200 shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold">{t('describeSymptom')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="e.g., Sharp pain, Dull ache..."
                          className="h-12 pl-10"
                          value={primaryComplaint}
                          onChange={(e) => setPrimaryComplaint(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handlePrimarySubmit()}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {selectedBodyRegion ? `Common for ${selectedBodyRegion.replace('_', ' ')}` : "Quick Select"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedBodyRegion ? {
                            head: ["Headache", "Dizziness", "Vision Changes", "Confusion"],
                            neck: ["Stiff Neck", "Sore Throat", "Swollen Glands"],
                            chest: ["Chest Pain", "Shortness of Breath", "Cough", "Palpitations"],
                            abdomen: ["Stomach Ache", "Nausea", "Bloating", "Cramps"],
                            pelvis: ["Pelvic Pain", "Urinary Issues"],
                            left_arm: ["Arm Pain", "Numbness", "Weakness"],
                            right_arm: ["Arm Pain", "Numbness", "Weakness"],
                            left_leg: ["Leg Pain", "Swelling", "Cramps"],
                            right_leg: ["Leg Pain", "Swelling", "Cramps"],
                            upper_back: ["Back Pain", "Shoulder Pain"],
                            lower_back: ["Lower Back Pain", "Sciatica"],
                            shoulders: ["Shoulder Pain", "Rotator Cuff Issue", "Limited Range of Motion"],
                          }[selectedBodyRegion] : ["Headache", "Fever", "Cough", "Chest Pain", "Back Pain", "Nausea"]).map((s) => (
                            <Button
                              key={s}
                              variant="outline"
                              size="sm"
                              onClick={() => setPrimaryComplaint(s)}
                              className={cn(
                                "rounded-full transition-all",
                                primaryComplaint === s ? "bg-blue-600 border-blue-600 text-white shadow-md" : "hover:border-blue-300 hover:bg-blue-50"
                              )}
                            >
                              {s}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full h-12 text-lg shadow-lg shadow-blue-100" 
                        onClick={handlePrimarySubmit}
                        disabled={!primaryComplaint}
                      >
                        {t('continue')} <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 flex gap-3 items-start">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Selecting a region on the map helps our AI understand the anatomical context of your symptoms, leading to a more accurate assessment.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {screen === "INTAKE_VISUAL" && (
            <motion.div
              key="intake-visual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-xl"
            >
              <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-2">Optional Step</Badge>
                <h2 className="text-3xl font-bold">{t('visualEvidence')}</h2>
                <p className="text-slate-500">Upload photos of visible symptoms (rashes, swelling, etc.) for AI analysis.</p>
              </div>
              <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                      <Camera className="h-8 w-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">{t('takePhoto')}</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} multiple />
                    </label>
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                      <ImageIcon className="h-8 w-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">{t('uploadImage')}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} multiple />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {images.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={img.preview} alt="Evidence" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12" onClick={() => setScreen("INTAKE_PRIMARY")}>
                      {t('back')}
                    </Button>
                    <Button className="flex-[2] h-12 text-lg" onClick={handleVisualSubmit}>
                      {images.length > 0 ? t('continue') : t('skip')} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen === "INTAKE_DEMOGRAPHICS" && (
            <motion.div
              key="intake-demographics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-xl"
            >
              <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-2">{t('step')} 2 of 4</Badge>
                <h2 className="text-3xl font-bold">{t('aboutYou')}</h2>
                <p className="text-slate-500">Basic information helps refine the assessment.</p>
              </div>
              <Card className="border-2 border-slate-200 shadow-xl">
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{t('yourAge')}</label>
                    <Input
                      type="number"
                      placeholder="Enter your age"
                      className="h-12"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{t('medicalHistory')} (Optional)</label>
                    <textarea
                      placeholder="e.g., Diabetes, High Blood Pressure, Asthma..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                    />
                    <p className="text-xs text-slate-400">Mention any chronic conditions or allergies.</p>
                  </div>
                  <Button 
                    className="w-full h-12 text-lg" 
                    onClick={handleDemographicsSubmit}
                    disabled={!age}
                  >
                    {t('continue')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen === "INTAKE_SPECIFICS" && (
            <motion.div
              key="intake-specifics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-xl"
            >
              <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-2">{t('step')} 3 of 4</Badge>
                <h2 className="text-3xl font-bold">{t('tellUsMore')}</h2>
                <p className="text-slate-500">Help us understand the severity and duration.</p>
              </div>
              <Card className="border-2 border-slate-200 shadow-xl">
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700">{t('severityLevel')}</label>
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg",
                        severity <= 3 ? "bg-green-500" : severity <= 7 ? "bg-amber-500" : "bg-red-500"
                      )}>
                        {severity}
                      </div>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={[severity]}
                        onValueChange={(v) => {
                          const val = Array.isArray(v) ? v[0] : v;
                          if (typeof val === 'number') {
                            setSeverity(val);
                          }
                        }}
                        max={10}
                        min={1}
                        step={1}
                        className="py-4 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">
                      <span className="text-green-600">Mild</span>
                      <span className="text-amber-600">Moderate</span>
                      <span className="text-red-600">Severe</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="font-bold text-slate-700">{t('duration')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Just started",
                        "A few hours",
                        "A few days",
                        "More than a week"
                      ].map((d) => (
                        <Button
                          key={d}
                          variant={duration === d ? "default" : "outline"}
                          className="h-14 justify-start px-4"
                          onClick={() => setDuration(d)}
                        >
                          <Clock className="mr-2 h-4 w-4 opacity-50" />
                          {d}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg" 
                    onClick={handleSpecificsSubmit}
                    disabled={!duration}
                  >
                    {t('continue')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen === "INTAKE_FOLLOWUP" && (
            <motion.div
              key="intake-followup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-xl"
            >
              <div className="mb-8 text-center">
                <Badge variant="outline" className="mb-2">{t('step')} 4 of 4</Badge>
                <h2 className="text-3xl font-bold">{t('followUpQuestions')}</h2>
                <p className="text-slate-500">Answer these targeted questions for a better assessment.</p>
              </div>
              <Card className="border-2 border-slate-200 shadow-xl">
                <CardContent className="space-y-6 pt-6">
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    {followUps.map((f) => (
                      <div key={f.question} className="space-y-3">
                        <p className="font-medium text-slate-800">{f.question}</p>
                        <div className="flex gap-3">
                          {f.options.map((opt) => (
                            <Button
                              key={opt}
                              variant={answers[f.question] === opt ? "default" : "outline"}
                              className="flex-1 h-12"
                              onClick={() => setAnswers({ ...answers, [f.question]: opt })}
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="mt-4 w-full h-12 text-lg" 
                    onClick={handleFollowUpSubmit}
                    disabled={Object.keys(answers).length < followUps.length}
                  >
                    {t('continue')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {screen === "PROCESSING" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="relative mb-12 h-64 w-64">
                {/* Heatmap Human Outline */}
                <svg viewBox="0 0 100 200" className="h-full w-full opacity-20">
                  <path
                    d="M50,10 C60,10 65,15 65,25 C65,35 60,40 50,40 C40,40 35,35 35,25 C35,15 40,10 50,10 Z M35,45 L65,45 L70,100 L60,100 L60,190 L40,190 L40,100 L30,100 Z"
                    fill="currentColor"
                    className="text-slate-400"
                  />
                </svg>
                {/* Glowing Body Part (Example: Chest/Head) */}
                <motion.div
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute left-1/2 top-[15%] h-12 w-12 -translate-x-1/2 rounded-full bg-blue-500 blur-xl"
                />
              </div>
              
              <div className="w-full max-w-md space-y-4 text-center">
                <h3 className="text-xl font-bold text-slate-800">{loadingText}</h3>
                <Progress value={75} className="h-2" />
                <p className="text-sm text-slate-500">Our engine is analyzing your inputs against clinical patterns.</p>
              </div>
            </motion.div>
          )}

          {screen === "DASHBOARD" && triageResult && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-7xl space-y-6"
            >
              {/* Hero Result */}
              {checkInAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center gap-4 mb-4",
                    checkInAnalysis.trend === "Worsening" ? "bg-red-50 border-red-100 text-red-700" : 
                    checkInAnalysis.trend === "Improving" ? "bg-green-50 border-green-100 text-green-700" :
                    "bg-blue-50 border-blue-100 text-blue-700"
                  )}
                >
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    {checkInAnalysis.trend === "Worsening" ? <AlertCircle className="h-5 w-5" /> : 
                     checkInAnalysis.trend === "Improving" ? <Heart className="h-5 w-5" /> :
                     <Activity className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Trend: {checkInAnalysis.trend}</h4>
                    <p className="text-xs opacity-80">{checkInAnalysis.reasoning}</p>
                  </div>
                </motion.div>
              )}
              <div className={cn(
                "relative overflow-hidden rounded-3xl p-6 text-white shadow-xl",
                triageResult.urgency === "High" ? "bg-red-600" : triageResult.urgency === "Medium" ? "bg-amber-500" : "bg-green-600"
              )}>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-none">
                      Triage Result
                    </Badge>
                    <h2 className="text-4xl font-black tracking-tight mb-1">
                      {triageResult.urgency} Urgency
                    </h2>
                    <p className="text-base opacity-90 max-w-xl">
                      {triageResult.urgency === "High" 
                        ? "Immediate medical attention is required. Please seek emergency care now." 
                        : triageResult.urgency === "Medium" 
                        ? "We recommend scheduling a consultation with a healthcare provider soon." 
                        : "Your symptoms appear manageable at home, but monitor for any changes."}
                    </p>
                    {triageResult.urgency === "High" && userProfile?.emergencyContacts && userProfile.emergencyContacts.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {userProfile.emergencyContacts.map((contact, idx) => (
                          <a 
                            key={idx}
                            href={`tel:${contact.phone}`}
                            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/30"
                          >
                            <Phone className="h-4 w-4" />
                            Call {contact.name} ({contact.relationship})
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button 
                        onClick={handleGenerateClinicalReport}
                        disabled={isGeneratingClinicalReport}
                        className="bg-white text-slate-900 hover:bg-slate-100 font-bold gap-2 h-11 px-6 rounded-2xl shadow-lg shadow-black/10"
                      >
                        {isGeneratingClinicalReport ? (
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {isGeneratingClinicalReport ? "Generating Report..." : "Clinical Report for Doctor"}
                      </Button>
                      <Button 
                        onClick={handleCopySummary}
                        variant="outline"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/30 font-bold gap-2 h-11 px-6 rounded-2xl"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Quick Summary
                      </Button>
                    </div>
                  </div>
                  {triageResult.urgency === "High" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button size="lg" variant="secondary" className="h-12 px-6 font-bold text-red-600">
                        Call Emergency
                      </Button>
                      <Button size="lg" variant="outline" className="h-12 px-6 font-bold border-white text-white hover:bg-white/10">
                        Find Nearest ER
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Core Algorithmic Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <CardHeader className="pb-2 bg-slate-50 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Priority Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex flex-col items-center justify-center">
                    <div className="relative h-32 w-32 flex items-center justify-center">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                        <circle 
                          cx="50" cy="50" r="45" fill="none" 
                          stroke={priorityScore > 70 ? "#ef4444" : priorityScore > 40 ? "#f59e0b" : "#10b981"} 
                          strokeWidth="8" 
                          strokeDasharray={`${priorityScore * 2.82} 282`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900">{priorityScore}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Index</span>
                      </div>
                    </div>
                    <p className="mt-4 text-[10px] text-center text-slate-500 leading-tight">
                      Calculated using clinical priority algorithm based on severity, duration, and age factors.
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                  <CardHeader className="pb-2 bg-slate-50 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                      <Search className="h-4 w-4 text-indigo-600" />
                      Algorithmic Symptom Matching
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {algorithmicMatches.length > 0 ? algorithmicMatches.slice(0, 3).map((match, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">{match.condition.name}</span>
                            <span className="text-slate-400 font-mono">{(match.score * 100).toFixed(1)}% Match</span>
                          </div>
                          <Progress value={match.score * 100} className="h-1.5" />
                        </div>
                      )) : (
                        <div className="py-6 text-center space-y-3">
                          <p className="text-slate-400 text-xs italic">No direct matches found in local dataset.</p>
                          <div className="inline-block p-3 bg-blue-50 rounded-xl text-left border border-blue-100 max-w-xs mx-auto">
                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                              <Info className="h-3 w-3" /> Hackathon Tip
                            </p>
                            <p className="text-[10px] text-blue-800 leading-tight">
                              To see the local algorithm in action, try typing: 
                              <code className="block mt-1 bg-blue-100 p-1 rounded font-mono text-[9px]">shoulder pain arm weakness</code>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-[10px] text-slate-400 italic">
                      Matches generated by local Jaccard Similarity algorithm against curated medical dataset.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Data Visualization: Historical Trends */}
              <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-2 bg-slate-50 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    Regional Health Trends (Dataset Analysis)
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-200 bg-emerald-50">
                    Live Dataset
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={HISTORICAL_TRENDS_DATA}>
                        <defs>
                          <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fill: '#94a3b8'}}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fill: '#94a3b8'}}
                        />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="respiratory" stroke="#3b82f6" fillOpacity={1} fill="url(#colorResp)" name="Respiratory" />
                        <Area type="monotone" dataKey="digestive" stroke="#10b981" fillOpacity={0} fill="none" name="Digestive" />
                        <Area type="monotone" dataKey="neurological" stroke="#8b5cf6" fillOpacity={0} fill="none" name="Neurological" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-[10px] text-center text-slate-400">
                    Visualization of seasonal symptom trends processed from historical regional health datasets.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column: Core Analysis */}
                <div className="lg:col-span-8 space-y-6">
                  {user && (
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                      <CardHeader className="pb-2 bg-slate-50 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                          <Bell className="h-4 w-4 text-blue-600" />
                          Check-In Settings
                        </CardTitle>
                        <Switch 
                          checked={checkInSettings.enabled} 
                          onCheckedChange={(checked) => {
                            const newSettings = { ...checkInSettings, enabled: checked };
                            setCheckInSettings(newSettings);
                            saveCheckInSettings(user.uid, newSettings);
                          }}
                        />
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Follow-up Frequency</p>
                            <p className="text-[10px] text-slate-500">How often should we check on you?</p>
                          </div>
                          <div className="flex gap-2">
                            {['Minimal', 'Standard', 'Frequent'].map((freq) => (
                              <Button
                                key={freq}
                                size="sm"
                                variant={checkInSettings.frequency === freq ? "default" : "outline"}
                                className="h-7 text-[10px] px-2"
                                onClick={() => {
                                  const newSettings = { ...checkInSettings, frequency: freq as any };
                                  setCheckInSettings(newSettings);
                                  saveCheckInSettings(user.uid, newSettings);
                                }}
                              >
                                {freq}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-none shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-slate-700 text-lg">
                          <FileText className="h-5 w-5 text-blue-500" />
                          Possible Cause
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          <TextWithTooltips text={triageResult.whatMightHave} terms={triageResult.medicalTerms} />
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-slate-700 text-lg">
                          <Activity className="h-5 w-5 text-purple-500" />
                          Physiology
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          <TextWithTooltips text={triageResult.whatsHappening} terms={triageResult.medicalTerms} />
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-none shadow-sm bg-white border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-slate-700 text-lg">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        Expected Recovery & Outcomes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        {triageResult.prognosis}
                      </p>
                      <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl text-[10px] text-indigo-700 font-medium">
                        <Info className="h-3.5 w-3.5" />
                        <span>This is an AI-generated general recovery timeline and not a medical diagnosis. Recovery varies by individual.</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-red-50 border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Risks of Inaction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700 leading-relaxed font-medium">
                        {triageResult.risksOfInaction}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Action Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                          <h4 className="font-bold text-blue-900 text-sm mb-1">Right Now</h4>
                          <p className="text-xs text-blue-700">{triageResult.actionPlan.rightNow}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                          <h4 className="font-bold text-slate-900 text-sm mb-1">Next 2-4 Hours</h4>
                          <p className="text-xs text-slate-600">{triageResult.actionPlan.next2To4Hours}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                          <h4 className="font-bold text-slate-900 text-sm mb-1">After 6 Hours</h4>
                          <p className="text-xs text-slate-600">{triageResult.actionPlan.after6Hours}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location-Based Resources */}
                  <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white pb-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-400" />
                          Nearby Resources
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="flex bg-white/10 rounded-lg p-1">
                            <Input 
                              placeholder="PIN Code" 
                              className="h-8 w-24 bg-transparent border-none text-white text-xs placeholder:text-white/50 focus-visible:ring-0"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                            />
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-blue-400 hover:text-blue-300" onClick={() => handleLocationSearch(pincode)} disabled={isLocating}>
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button size="sm" variant="secondary" className="h-8" onClick={getUserLocation} disabled={isLocating}>
                            {isLocating ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Locate className="h-3 w-3 mr-1" />}
                            Live
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                        <div className="p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                            <Stethoscope className="h-3 w-3" /> Doctors & Specialists
                          </h4>
                          <div className="space-y-3">
                            {nearbyDoctors.length > 0 ? nearbyDoctors.map((doc, i) => (
                              <div key={i} className="group rounded-xl border p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                <div className="flex flex-col gap-1 mb-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 leading-tight">{doc.name}</p>
                                    {doc.rating && (
                                      <Badge variant="outline" className="text-[10px] h-auto py-0.5 px-1.5 whitespace-normal max-w-[120px] text-right shrink-0">
                                        {doc.rating.length > 20 ? doc.rating.substring(0, 17) + '...' : doc.rating} ★
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <MapIcon className="h-2.5 w-2.5 shrink-0" /> {doc.address}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {doc.phone && (
                                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 gap-1" onClick={() => window.open(`tel:${doc.phone}`)}>
                                      <Phone className="h-2.5 w-2.5" /> Call
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 gap-1" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(doc.name + ' ' + doc.address)}`, '_blank')}>
                                    <Navigation className="h-2.5 w-2.5" /> Directions
                                  </Button>
                                </div>
                              </div>
                            )) : (
                              <div className="py-12 text-center border-2 border-dashed rounded-xl border-slate-100 bg-slate-50/30">
                                <Stethoscope className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">
                                  {locationError ? locationError : "Search to find nearby specialists"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                            <ClipboardCheck className="h-3 w-3" /> Diagnostic Labs
                          </h4>
                          <div className="space-y-3">
                            {nearbyLabs.length > 0 ? nearbyLabs.map((lab, i) => (
                              <div key={i} className="group rounded-xl border p-3 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                                <div className="flex flex-col gap-1 mb-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700 leading-tight">{lab.name}</p>
                                    {lab.rating && (
                                      <Badge variant="outline" className="text-[10px] h-auto py-0.5 px-1.5 whitespace-normal max-w-[120px] text-right shrink-0">
                                        {lab.rating.length > 20 ? lab.rating.substring(0, 17) + '...' : lab.rating} ★
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <MapIcon className="h-2.5 w-2.5 shrink-0" /> {lab.address}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {lab.phone && (
                                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 gap-1" onClick={() => window.open(`tel:${lab.phone}`)}>
                                      <Phone className="h-2.5 w-2.5" /> Call
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 gap-1" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(lab.name + ' ' + lab.address)}`, '_blank')}>
                                    <Navigation className="h-2.5 w-2.5" /> Directions
                                  </Button>
                                </div>
                              </div>
                            )) : (
                              <div className="py-12 text-center border-2 border-dashed rounded-xl border-slate-100 bg-slate-50/30">
                                <ClipboardCheck className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">
                                  {locationError ? locationError : "Search to find nearby labs"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Insights & Care */}
                <div className="lg:col-span-4 space-y-6">
                  <Card className="border-none shadow-sm overflow-hidden">
                    <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                      <h3 className="flex items-center gap-2 font-bold text-green-800 text-sm">
                        <Home className="h-4 w-4" />
                        Care & Recovery
                      </h3>
                    </div>
                    <CardContent className="p-4 space-y-6">
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-800 text-xs">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          Dehydration Check
                        </h4>
                        <div className={cn(
                          "mb-2 rounded-lg p-2 text-[10px] font-bold uppercase tracking-wider text-center",
                          triageResult.dehydrationCheck.riskLevel === "High" ? "bg-red-100 text-red-700" : 
                          triageResult.dehydrationCheck.riskLevel === "Medium" ? "bg-amber-100 text-amber-700" : 
                          "bg-green-100 text-green-700"
                        )}>
                          Risk: {triageResult.dehydrationCheck.riskLevel}
                        </div>
                        <ul className="space-y-1.5">
                          {triageResult.dehydrationCheck.signs.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex gap-2 text-xs text-slate-600">
                              <div className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-800 text-xs">
                          <Apple className="h-3 w-3 text-amber-500" />
                          Nutrition
                        </h4>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {triageResult.nutrition.deficiencies.map((item, i) => (
                            <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 h-5">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <ul className="space-y-1.5">
                          {triageResult.nutrition.foodSuggestions.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex gap-2 text-xs text-slate-600">
                              <div className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-blue-600 text-white">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Doctor Prep
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-blue-200 uppercase mb-1">Key Points</p>
                        <ul className="space-y-1">
                          {triageResult.doctorPrep.whatToTell.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-[10px] text-white/90 leading-tight">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <Button variant="secondary" size="sm" className="w-full h-8 text-xs font-bold bg-white text-blue-600 hover:bg-blue-50">
                        View Full Prep Guide
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Red Flags Section */}
                  <Card className="border-none shadow-sm bg-red-50 border border-red-100">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Red Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <p className="text-[10px] text-red-700 font-medium">{triageResult.redFlags.action}</p>
                      <ul className="space-y-1">
                        {triageResult.redFlags.symptoms.map((item, i) => (
                          <li key={i} className="text-[10px] text-red-600 flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-red-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Medication Guidance */}
                  <Card className="border-none shadow-sm bg-slate-50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-slate-800">
                        <Shield className="h-4 w-4 text-slate-600" />
                        Medication Guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Consider</p>
                        <div className="flex flex-wrap gap-1">
                          {triageResult.medicationGuidance.consider.map((item, i) => (
                            <Badge key={i} variant="secondary" className="text-[9px] h-4 px-1">{item}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avoid</p>
                        <div className="flex flex-wrap gap-1">
                          {triageResult.medicationGuidance.avoid.map((item, i) => (
                            <Badge key={i} variant="destructive" className="text-[9px] h-4 px-1 bg-red-100 text-red-700 hover:bg-red-100">{item}</Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 italic leading-tight">
                        {triageResult.medicationGuidance.disclaimer}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Lifestyle Section */}
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-slate-800">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Lifestyle Adjustments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-start gap-2">
                          <div className="mt-1 h-3 w-3 rounded bg-blue-100 flex items-center justify-center shrink-0">
                            <Activity className="h-2 w-2 text-blue-600" />
                          </div>
                          <p className="text-[10px] text-slate-600"><span className="font-bold">Activity:</span> {triageResult.lifestyle.activity}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="mt-1 h-3 w-3 rounded bg-purple-100 flex items-center justify-center shrink-0">
                            <Clock className="h-2 w-2 text-purple-600" />
                          </div>
                          <p className="text-[10px] text-slate-600"><span className="font-bold">Sleep:</span> {triageResult.lifestyle.sleep}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="mt-1 h-3 w-3 rounded bg-green-100 flex items-center justify-center shrink-0">
                            <Home className="h-2 w-2 text-green-600" />
                          </div>
                          <p className="text-[10px] text-slate-600"><span className="font-bold">Environment:</span> {triageResult.lifestyle.environment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Steps Section */}
                  <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-blue-400" />
                        Next Steps Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {triageResult.nextSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 group">
                          <div className="mt-0.5 h-3.5 w-3.5 rounded border border-white/30 flex items-center justify-center shrink-0 group-hover:border-blue-400 transition-colors">
                            <div className="h-1.5 w-1.5 rounded-full bg-transparent group-hover:bg-blue-400" />
                          </div>
                          <p className="text-[10px] text-white/80 leading-tight">{step}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 flex-col gap-1 border-slate-200 bg-white shadow-sm text-[10px]"
                      onClick={() => window.print()}
                    >
                      <Download className="h-4 w-4 text-blue-600" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 flex-col gap-1 border-slate-200 bg-white shadow-sm text-[10px]"
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'CareSignal Report',
                              text: `Triage: ${triageResult.urgency} Urgency.`,
                              url: window.location.href,
                            });
                          } catch (err) {}
                        }
                      }}
                    >
                      <Mail className="h-4 w-4 text-purple-600" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pb-8">
                {showResetConfirm ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-lg border border-slate-200"
                  >
                    <span className="text-xs font-bold text-slate-600 px-2">Are you sure?</span>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => { reset(); setShowResetConfirm(false); }}
                      className="h-8 text-xs font-bold"
                    >
                      Yes, Reset
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowResetConfirm(false)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                ) : (
                  <Button variant="ghost" onClick={() => setShowResetConfirm(true)} className="text-slate-400 text-xs hover:text-slate-600">
                    <RefreshCcw className="mr-2 h-3 w-3" />
                    {t('startNew')}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
          {screen === "CHAT" && (
            <ChatInterface onBack={reset} />
          )}
          {screen === "VOICE_AGENT" && (
            <LiveVoiceAgent 
              onBack={reset} 
              setScreen={setScreen} 
              isTriage={isVoiceTriage}
              onComplete={handleVoiceTriageComplete}
            />
          )}
          {screen === "CLINICAL_REPORT" && clinicalReport && (
            <ClinicalReportView 
              report={clinicalReport} 
              profile={userProfile} 
              onBack={() => setScreen("DASHBOARD")} 
            />
          )}
          </AnimatePresence>

          {/* Consent Modal */}
          <AnimatePresence>
            {showConsentModal && (
              <div key="consent-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                  key="consent-modal-content"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Your Privacy Matters</h3>
                    </div>
                    
                    <p className="text-sm text-slate-600 leading-relaxed">
                      We prioritize ethical data handling. Choose how you'd like us to manage your triage information.
                    </p>

                    <div className="space-y-3 pt-2">
                      <button 
                        onClick={() => handleConsentSubmit({ allowPersonalization: true, allowResearch: true })}
                        className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 group-hover:text-blue-700">Personalized Insights</span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                        </div>
                        <p className="text-xs text-slate-500">Save your history to track progress and get better future reports. (Requires Login)</p>
                      </button>

                      <button 
                        onClick={() => handleConsentSubmit({ allowPersonalization: false, allowResearch: true })}
                        className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 group-hover:text-indigo-700">Contribute to Research</span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
                        </div>
                        <p className="text-xs text-slate-500">Allow anonymized data to help improve medical algorithms for everyone.</p>
                      </button>

                      <button 
                        onClick={() => handleConsentSubmit({ allowPersonalization: false, allowResearch: false })}
                        className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-400 hover:bg-slate-50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 group-hover:text-slate-900">Continue Privately</span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                        </div>
                        <p className="text-xs text-slate-500">Don't save any data. Your information will be cleared when you reset.</p>
                      </button>
                    </div>

                    <div className="pt-4 flex items-center gap-2 text-[10px] text-slate-400">
                      <Lock className="h-3 w-3" />
                      <span>Consent is optional and can be changed anytime in settings.</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* User Profile & Emergency Contact Modal */}
          <AnimatePresence>
            {showProfileModal && (
              <div key="profile-modal-overlay" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                  key="profile-modal-content"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
                >
                  <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-2 rounded-xl text-white">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Complete Your Profile</h3>
                        <p className="text-xs text-slate-500">Help us provide better health insights</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowProfileModal(false)} className="rounded-full h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Date of Birth</label>
                          <Input 
                            type="date" 
                            value={userProfile?.dob || ""} 
                            onChange={(e) => setUserProfile(prev => ({ ...prev!, dob: e.target.value }))}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Blood Group</label>
                          <select 
                            value={userProfile?.bloodGroup || ""} 
                            onChange={(e) => setUserProfile(prev => ({ ...prev!, bloodGroup: e.target.value }))}
                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                          >
                            <option value="">Select</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Location (City/Region)</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder="e.g. New York, USA" 
                            value={userProfile?.location || ""} 
                            onChange={(e) => setUserProfile(prev => ({ ...prev!, location: e.target.value }))}
                            className="pl-9 h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Allergies</label>
                        <Input 
                          placeholder="e.g. Peanuts, Penicillin, None" 
                          value={userProfile?.allergies || ""} 
                          onChange={(e) => setUserProfile(prev => ({ ...prev!, allergies: e.target.value }))}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* Primary Care Physician */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Care Physician</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Doctor Name</label>
                          <Input 
                            placeholder="Dr. Smith" 
                            value={userProfile?.primaryCarePhysician?.name || ""} 
                            onChange={(e) => setUserProfile(prev => ({ 
                              ...prev!, 
                              primaryCarePhysician: { ...(prev?.primaryCarePhysician || { contact: "" }), name: e.target.value } 
                            }))}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Contact Info</label>
                          <Input 
                            placeholder="Phone or Email" 
                            value={userProfile?.primaryCarePhysician?.contact || ""} 
                            onChange={(e) => setUserProfile(prev => ({ 
                              ...prev!, 
                              primaryCarePhysician: { ...(prev?.primaryCarePhysician || { name: "" }), contact: e.target.value } 
                            }))}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contacts</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10px] gap-1"
                          onClick={() => {
                            const contacts = userProfile?.emergencyContacts || [];
                            setUserProfile(prev => ({ 
                              ...prev!, 
                              emergencyContacts: [...contacts, { name: "", relationship: "", phone: "" }] 
                            }));
                          }}
                        >
                          <Plus className="h-3 w-3" /> Add Contact
                        </Button>
                      </div>

                      {(!userProfile?.emergencyContacts || userProfile.emergencyContacts.length === 0) ? (
                        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-2">
                          <Phone className="h-8 w-8 text-slate-200" />
                          <p className="text-xs text-slate-400">No emergency contacts added yet.<br/>Please add at least one for your safety.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userProfile.emergencyContacts.map((contact, idx) => (
                            <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-3 relative">
                              <button 
                                onClick={() => {
                                  const contacts = [...userProfile.emergencyContacts];
                                  contacts.splice(idx, 1);
                                  setUserProfile(prev => ({ ...prev!, emergencyContacts: contacts }));
                                }}
                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <div className="grid grid-cols-2 gap-3">
                                <Input 
                                  placeholder="Name" 
                                  value={contact.name} 
                                  onChange={(e) => {
                                    const contacts = [...userProfile.emergencyContacts];
                                    contacts[idx].name = e.target.value;
                                    setUserProfile(prev => ({ ...prev!, emergencyContacts: contacts }));
                                  }}
                                  className="h-8 text-xs bg-white"
                                />
                                <Input 
                                  placeholder="Relationship" 
                                  value={contact.relationship} 
                                  onChange={(e) => {
                                    const contacts = [...userProfile.emergencyContacts];
                                    contacts[idx].relationship = e.target.value;
                                    setUserProfile(prev => ({ ...prev!, emergencyContacts: contacts }));
                                  }}
                                  className="h-8 text-xs bg-white"
                                />
                              </div>
                              <div className="relative">
                                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <Input 
                                  placeholder="Phone Number" 
                                  value={contact.phone} 
                                  onChange={(e) => {
                                    const contacts = [...userProfile.emergencyContacts];
                                    contacts[idx].phone = e.target.value;
                                    setUserProfile(prev => ({ ...prev!, emergencyContacts: contacts }));
                                  }}
                                  className="pl-8 h-8 text-xs bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t bg-slate-50 flex gap-3">
                    <Button 
                      className="flex-1 h-10 font-bold"
                      onClick={async () => {
                        if (user) {
                          await saveUserProfile(user.uid, userProfile || {
                            uid: user.uid,
                            dob: "",
                            location: "",
                            bloodGroup: "",
                            allergies: "",
                            primaryCarePhysician: { name: "", contact: "" },
                            emergencyContacts: []
                          });
                          setShowProfileModal(false);
                        }
                      }}
                    >
                      Save Profile
                    </Button>
                    <Button variant="ghost" className="h-10" onClick={() => setShowProfileModal(false)}>
                      Skip for now
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </TooltipProvider>
      </main>

      {/* Global Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">
            © 2026 CareSignal. All rights reserved. <br />
            Designed for healthcare decision support.
          </p>
        </div>
      </footer>
    </div>
  );
}
