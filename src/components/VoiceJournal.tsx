import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Mic,
  Play,
  Pause,
  Square,
  Trash2,
  Heart,
  Search,
  Volume2,
  FileAudio,
  Sparkles,
  Brain,
  AlertTriangle,
  Shield,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { testMicrophoneAccess, getMicrophoneErrorSolution, checkMicrophoneSupport } from "../../utils/microphoneTest";

interface VoiceEntry {
  id: string;
  title: string;
  audioBlob?: Blob;
  audioUrl?: string;
  transcription?: string;
  duration: number;
  timestamp: Date;
  mood?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'excited' | 'calm';
  tags: string[];
  isPlaying?: boolean;
  isFavorite?: boolean;
  aiInsights?: string;
}

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'prompt';

export function VoiceJournal() {
  // --- core state (kept all your original fields) ---
  const [entries, setEntries] = useState<VoiceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // new
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [newEntryDialog, setNewEntryDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<VoiceEntry>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermission, setMicPermission] = useState<PermissionStatus>('unknown');
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  // --- audio refs and helpers ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingInterval = useRef<number | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    loadEntries();

    const initPermissions = async () => {
      try {
        await checkMicrophonePermission();
      } catch (error) {
        console.warn('Permission check failed:', error);
        setMicPermission('unknown');
      }
    };
    initPermissions();

    return () => {
      stopVisualizer();
      if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
      }
      if (recordingInterval.current) window.clearInterval(recordingInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Permissions ----------------
  const checkMicrophonePermission = async () => {
    try {
      const supportCheck = checkMicrophoneSupport();
      if (!supportCheck.isSupported || !supportCheck.isSecure) {
        setMicPermission('denied');
        return;
      }

      if ((navigator as any).permissions && (navigator as any).permissions.query) {
        try {
          const permissionStatus: PermissionStatus = (await (navigator as any).permissions.query({ name: 'microphone' }))?.state ?? 'unknown';
          setMicPermission(permissionStatus);
          // we can't reliably addEventListener on all browsers, but try:
          try {
            const ps = await (navigator as any).permissions.query({ name: 'microphone' });
            // @ts-ignore
            ps.addEventListener && ps.addEventListener('change', () => setMicPermission(ps.state));
          } catch {}
        } catch {
          setMicPermission('unknown');
        }
      } else {
        setMicPermission('unknown');
      }
    } catch {
      setMicPermission('unknown');
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        toast.error("Microphone access requires HTTPS. Please use a secure connection.");
        setMicPermission('denied');
        setShowPermissionHelp(true);
        return false;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Microphone not supported in this browser.");
        setMicPermission('denied');
        return false;
      }

      if (micPermission !== 'granted') {
        toast.info("Requesting microphone access — please allow the browser prompt.");
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        stream.getTracks().forEach(t => t.stop());
        setMicPermission('granted');
        toast.success("Microphone access granted");
        return true;
      } catch (err: any) {
        if (err && err.name === 'NotAllowedError') {
          setMicPermission('denied');
          setShowPermissionHelp(true);
          toast.error("Microphone permission denied. Please enable it in browser settings.");
        } else {
          toast.error("Unable to access microphone.");
        }
        return false;
      }
    } catch (err) {
      toast.error("Microphone request failed.");
      return false;
    }
  };

  // ---------------- Visualizer helpers ----------------
  function startVisualizerFromStream(stream: MediaStream) {
    stopVisualizer();

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyserRef.current = analyser;

      const src = ctx.createMediaStreamSource(stream);
      sourceRef.current = src;
      src.connect(analyser);

      drawVisualizer();
    } catch (err) {
      console.warn("Visualizer start failed:", err);
    }
  }

  function startVisualizerFromAudioElement(el: HTMLAudioElement) {
    stopVisualizer();

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyserRef.current = analyser;

      const src = ctx.createMediaElementSource(el);
      sourceRef.current = src;
      src.connect(analyser);
      analyser.connect(ctx.destination); // route audio out
      drawVisualizer();
    } catch (err) {
      console.warn("Visualizer (playback) failed:", err);
    }
  }

  function stopVisualizer() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      if (sourceRef.current) {
        // @ts-ignore
        try { sourceRef.current.disconnect(); } catch {}
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        try { analyserRef.current.disconnect(); } catch {}
        analyserRef.current = null;
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
        audioContextRef.current = null;
      }
    } catch (err) {
      console.warn("Visualizer cleanup error:", err);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  function drawVisualizer() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !analyser) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const { width, height } = canvas;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6b7280'; // subtle color
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
  }

  // ---------------- Recording logic (start / pause / resume / stop) ----------------
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Audio recording not supported in this browser');
        return;
      }

      if (micPermission === 'denied') {
        setShowPermissionHelp(true);
        toast.error('Microphone permission denied — enable in browser settings.');
        return;
      }

      if (micPermission !== 'granted') {
        const ok = await requestMicrophonePermission();
        if (!ok) return;
        // small delay so state stabilizes
        await new Promise(r => setTimeout(r, 120));
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });

      setAudioStream(stream);

      // choose mime type gracefully
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
      else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
      // pass empty options if none supported
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recordingChunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordingChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(recordingChunks.current, { type: recorder.mimeType || 'audio/webm' });
          // create URL for playback
          const url = URL.createObjectURL(blob);

          // mock transcription (local heuristic); in production use an STT backend or service
          const mockTranscription = "Short mock transcription. Replace with real STT integration.";
          const suggestedMood = suggestMoodFromText(mockTranscription);
          const suggestedTags = suggestTagsFromText(mockTranscription);

          setCurrentEntry({
            audioBlob: blob,
            audioUrl: url,
            transcription: mockTranscription,
            duration: recordingTime,
            timestamp: new Date(),
            mood: suggestedMood || 'neutral',
            tags: suggestedTags
          });

          setNewEntryDialog(true);
          setRecordingTime(0);
          setIsPaused(false);
          stopVisualizer();
        } catch (err) {
          console.error('onstop error', err);
        }
      };

      recorder.onerror = (err) => {
        console.error('Recorder error', err);
        toast.error('Recording error occurred');
        stopRecording();
      };

      setMediaRecorder(recorder);
      recorder.start(1000); // emit chunks each second
      setIsRecording(true);
      setIsPaused(false);

      // start timer
      if (recordingInterval.current) window.clearInterval(recordingInterval.current);
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // visualizer
      startVisualizerFromStream(stream);

      toast.success('Recording started');
    } catch (err) {
      console.error('startRecording failed', err);
      toast.error('Failed to start recording');
    }
  };

  const pauseRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        setIsPaused(true);
        if (recordingInterval.current) { window.clearInterval(recordingInterval.current); recordingInterval.current = null; }
        toast.info('Recording paused');
      }
    } catch (err) {
      console.error('pause error', err);
    }
  };

  const resumeRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        setIsPaused(false);
        if (recordingInterval.current) window.clearInterval(recordingInterval.current);
        recordingInterval.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        toast.success('Recording resumed');
      }
    } catch (err) {
      console.error('resume error', err);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        // stopping will trigger onstop, which will finalize the blob etc.
        mediaRecorder.stop();
      }

      setIsRecording(false);
      setIsPaused(false);

      if (recordingInterval.current) { window.clearInterval(recordingInterval.current); recordingInterval.current = null; }

      if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
        setAudioStream(null);
      }

      // allow onstop handler to process chunks; but also stop visualizer
      stopVisualizer();

      toast.success('Recording stopped');
    } catch (err) {
      console.error('stopRecording error', err);
    }
  };

  // ---------------- Playback / entries / save ----------------
  const playAudio = (entry: VoiceEntry) => {
    try {
      // if already playing this entry --> pause
      if (currentPlayingId === entry.id) {
        audioRef.current?.pause();
        setCurrentPlayingId(null);
        stopVisualizer();
        return;
      }

      // stop existing playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      stopVisualizer();

      if (!entry.audioUrl) {
        // create URL from blob fallback
        if (entry.audioBlob) entry.audioUrl = URL.createObjectURL(entry.audioBlob);
        else {
          toast.error('No audio found for this entry.');
          return;
        }
      }

      if (audioRef.current) {
        audioRef.current.src = entry.audioUrl!;
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setCurrentPlayingId(entry.id);
          // start playback visualizer
          startVisualizerFromAudioElement(audioRef.current!);
        }).catch(err => {
          console.error('play failed', err);
          toast.error('Playback failed');
        });

        audioRef.current.onended = () => {
          setCurrentPlayingId(null);
          stopVisualizer();
        };

        audioRef.current.onerror = () => {
          setCurrentPlayingId(null);
          stopVisualizer();
        };
      }
    } catch (err) {
      console.error('playAudio error', err);
    }
  };

  const saveVoiceEntry = async () => {
    if (!currentEntry.audioBlob) {
      toast.error('No audio to save');
      return;
    }

    setIsProcessing(true);

    // build entry
    const entry: VoiceEntry = {
      id: Date.now().toString(),
      title: currentEntry.title || `Voice Entry ${new Date().toLocaleDateString()}`,
      audioBlob: currentEntry.audioBlob,
      audioUrl: currentEntry.audioUrl || (currentEntry.audioBlob ? URL.createObjectURL(currentEntry.audioBlob) : undefined),
      transcription: currentEntry.transcription || 'Mock transcription (replace with STT)',
      duration: currentEntry.duration || 0,
      timestamp: currentEntry.timestamp || new Date(),
      mood: currentEntry.mood || 'neutral',
      tags: currentEntry.tags || [],
      aiInsights: currentEntry.aiInsights || "Mock insight: try reflecting on recurring themes.",
      isFavorite: false
    };

    // pretend some processing delay
    await new Promise(r => setTimeout(r, 900));

    const updated = [entry, ...entries];
    saveEntries(updated);

    setCurrentEntry({});
    setNewEntryDialog(false);
    setIsProcessing(false);
    toast.success('Saved entry to journal');
  };

  const deleteEntry = (id: string) => {
    if (!confirm('Delete this entry?')) return;
    const updated = entries.filter(e => e.id !== id);
    saveEntries(updated);
    toast.success('Entry deleted');
  };

  const toggleFavorite = (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e);
    saveEntries(updated);
  };

  const loadEntries = () => {
    try {
      const raw = localStorage.getItem('voice-journal-entries');
      if (!raw) return;
      const parsed = JSON.parse(raw).map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }));
      setEntries(parsed);
    } catch (err) {
      console.warn('loadEntries failed', err);
    }
  };

  const saveEntries = (list: VoiceEntry[]) => {
    localStorage.setItem('voice-journal-entries', JSON.stringify(list));
    setEntries(list);
  };

  // ---------------- small creative features (keyword heuristics) ----------------
  function suggestMoodFromText(text = ''): VoiceEntry["mood"] {
    const t = (text || '').toLowerCase();
    if (!t) return 'neutral';
    const happy = ['happy','joy','glad','grateful','excited','great'];
    const sad = ['sad','depressed','unhappy','down','lonely'];
    const anxious = ['anxious','anx','worried','nervous','panic','stressed'];
    const calm = ['calm','relaxed','peaceful','serene','calmly'];
    for (const w of happy) if (t.includes(w)) return 'happy';
    for (const w of sad) if (t.includes(w)) return 'sad';
    for (const w of anxious) if (t.includes(w)) return 'anxious';
    for (const w of calm) if (t.includes(w)) return 'calm';
    return 'neutral';
  }

  function suggestTagsFromText(text = ''): string[] {
    const t = (text || '').toLowerCase();
    const tags: string[] = [];
    if (!t) return tags;
    const map: Record<string, string[]> = {
      'work': ['work','job','boss','office'],
      'sleep': ['sleep','insomnia','rest'],
      'relationships': ['friend','partner','relationship','love'],
      'anxiety': ['anxious','worry','panic','stress'],
      'gratitude': ['grateful', 'thankful'],
    };
    for (const tag in map) {
      if (map[tag].some(k => t.includes(k))) tags.push(tag);
    }
    return tags;
  }

  // ---------------- small utility ----------------
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ---------------- filtered view ----------------
  const filteredEntries = entries.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || e.title.toLowerCase().includes(q) || (e.transcription || '').toLowerCase().includes(q) || e.tags.some(t => t.includes(q));
    const matchesMood = selectedMood === 'all' || e.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  // ---------------- UI ----------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">Voice Journal</h2>
            <p className="text-gray-600 dark:text-gray-300">Record and reflect on your thoughts with AI-friendly features</p>
          </div>
        </div>
      </motion.div>

      {/* Permission / Status Alerts */}
      <AnimatePresence>
        {micPermission !== 'granted' && micPermission !== 'unknown' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Alert className={`mb-6 ${micPermission === 'denied' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <div className="flex items-center space-x-3">
                {micPermission === 'denied' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Shield className="w-5 h-5 text-yellow-600" />}
                <div className="flex-1">
                  <AlertDescription>
                    {micPermission === 'denied' && (
                      <>
                        Microphone access denied. <Button variant="link" className="h-auto p-0 font-medium underline" onClick={() => setShowPermissionHelp(true)}>How to enable</Button>
                      </>
                    )}
                    {micPermission === 'prompt' && 'Click "Grant Permission" to enable voice recording features.'}
                  </AlertDescription>
                </div>
                {micPermission === 'prompt' && <Button onClick={requestMicrophonePermission} size="sm" className="text-white bg-yellow-600">Grant Permission</Button>}
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {micPermission === 'granted' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-800">Microphone access granted. You can now record voice journal entries.</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Card (preserves your glassmorphism area and large mic button) */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/50 dark:to-teal-900/50 border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-lg">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="mb-6">
              {/* big circular mic + dynamic icons for pause/resume */}
              <div className="relative inline-block">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-colors ${isRecording ? (isPaused ? 'bg-yellow-500' : 'bg-red-500') : 'bg-emerald-500'}`}>
                  {!isRecording ? (
                    <Button onClick={startRecording} aria-label="Start recording" className="flex items-center justify-center w-20 h-20 bg-transparent rounded-full shadow-none">
                      <Mic className="w-8 h-8 text-white" />
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <Button onClick={isPaused ? resumeRecording : pauseRecording} aria-label={isPaused ? 'Resume recording' : 'Pause recording'} className="flex items-center justify-center rounded-full w-14 h-14 bg-white/10">
                        {isPaused ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
                      </Button>
                      <Button onClick={stopRecording} aria-label="Stop recording" className="flex items-center justify-center rounded-full w-14 h-14 bg-white/10">
                        <Square className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* pulsing ring while recording */}
                {isRecording && !isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-red-300 rounded-full w-36 h-36 animate-pulse opacity-40" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold">{isRecording ? (isPaused ? 'Paused' : 'Recording in progress...') : 'Ready to record'}</h3>
              <div className="font-mono text-2xl text-gray-700">{isRecording ? (isPaused ? 'Paused' : formatDuration(recordingTime)) : 'Tap the microphone to start'}</div>
              <p className="mt-2 text-gray-600">Your audio will be processed for transcription and AI insights after saving.</p>
            </div>

            {/* visualizer canvas (creative) */}
            <div className="w-full max-w-3xl mt-8">
              <canvas ref={canvasRef} width={1200} height={120} className="w-full h-24 rounded-lg bg-white/10" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search + Filter */}
      <motion.div className="flex flex-col gap-4 sm:flex-row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input placeholder="Search entries by title, content, or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 backdrop-blur-sm bg-white/80" />
        </div>
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-48 backdrop-blur-sm bg-white/80">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            <SelectItem value="happy">😊 Happy</SelectItem>
            <SelectItem value="excited">🤗 Excited</SelectItem>
            <SelectItem value="calm">😌 Calm</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="anxious">😰 Anxious</SelectItem>
            <SelectItem value="sad">😢 Sad</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Overview */}
      <motion.div className="grid grid-cols-2 gap-4 md:grid-cols-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-white/80">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{entries.length}</div>
            <p className="text-sm text-gray-600">Total Entries</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(entries.reduce((s, e) => s + e.duration, 0) / 60)}</div>
            <p className="text-sm text-gray-600">Minutes Recorded</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{entries.filter(e => e.isFavorite).length}</div>
            <p className="text-sm text-gray-600">Favorites</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length}</div>
            <p className="text-sm text-gray-600">Today</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Entries list */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredEntries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="bg-white/80">
                <CardContent className="py-12 text-center">
                  <FileAudio className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold">No voice entries yet</h3>
                  <p className="text-gray-600">Start recording your first voice journal entry to begin your journey</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredEntries.map((entry, idx) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -4 }}>
                  <Card className="bg-white/80">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center space-x-3">
                            <span>{entry.title}</span>
                            <Badge className={`border ${getMoodColor(entry.mood || 'neutral')}`}>{getMoodIcon(entry.mood || 'neutral')} {entry.mood}</Badge>
                            {entry.isFavorite && <Heart className="w-4 h-4 text-red-500" />}
                          </CardTitle>
                          <p className="mt-1 text-sm text-gray-500">{entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => playAudio(entry)} className="p-2">
                            {currentPlayingId === entry.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleFavorite(entry.id)} className="p-2">
                            <Heart className={`w-4 h-4 ${entry.isFavorite ? 'text-red-500' : ''}`} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteEntry(entry.id)} className="p-2 text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                        <Volume2 className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Duration: {formatDuration(entry.duration)}</div>
                        </div>
                      </div>

                      {entry.transcription && (
                        <div className="p-4 rounded-lg bg-blue-50">
                          <h4 className="flex items-center mb-2 font-medium text-blue-900">
                            <FileAudio className="w-4 h-4 mr-2" /> Transcription
                          </h4>
                          <p className="text-sm italic text-blue-800">"{entry.transcription}"</p>
                        </div>
                      )}

                      {entry.aiInsights && (
                        <div className="p-4 rounded-lg bg-purple-50">
                          <h4 className="flex items-center mb-2 font-medium text-purple-900">
                            <Brain className="w-4 h-4 mr-2" /> AI Insights
                          </h4>
                          <p className="text-sm text-purple-800">{entry.aiInsights}</p>
                        </div>
                      )}

                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag, tIdx) => <Badge key={tIdx} variant="outline" className="text-xs">#{tag}</Badge>)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Save dialog */}
      <Dialog open={newEntryDialog} onOpenChange={setNewEntryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2"><Sparkles className="w-5 h-5 text-emerald-600" /><span>Save Voice Journal Entry</span></DialogTitle>
            <DialogDescription>Add details and save your voice recording to your journal.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Entry Title</label>
              <Input placeholder="Give your entry a meaningful title..." value={currentEntry.title || ''} onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })} />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">How are you feeling?</label>
              <Select value={currentEntry.mood} onValueChange={(v: string) => setCurrentEntry({ ...currentEntry, mood: v as any })}>
                <SelectTrigger><SelectValue placeholder="Select your mood" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="excited">🤗 Excited</SelectItem>
                  <SelectItem value="calm">😌 Calm</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="anxious">😰 Anxious</SelectItem>
                  <SelectItem value="sad">😢 Sad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Tags (optional)</label>
              <Input placeholder="Add tags separated by commas (e.g., reflection, work)" value={(currentEntry.tags || []).join(', ')} onChange={(e) => setCurrentEntry({ ...currentEntry, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
            </div>

            <div className="p-4 rounded-lg bg-gray-50">
              <p className="mb-2 text-sm text-gray-600"><strong>Recording Duration:</strong> {formatDuration(currentEntry.duration || 0)}</p>
              <p className="text-sm text-gray-600">Your audio will be processed with AI transcription and insights (mocked locally). You can edit title/mood/tags before saving.</p>
            </div>

            {/* suggested mood / tags area */}
            <div>
              <h4 className="mb-2 text-sm font-medium">Suggested mood & tags</h4>
              <div className="flex items-center gap-3">
                <Badge className={`px-3 py-1 ${getMoodColor(currentEntry.mood || 'neutral')}`}>{getMoodIcon(currentEntry.mood || 'neutral')} {currentEntry.mood}</Badge>
                {(currentEntry.tags || []).slice(0, 5).map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={saveVoiceEntry} disabled={isProcessing || !currentEntry.title?.trim()} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600">
                {isProcessing ? 'Processing...' : <><FileAudio className="w-4 h-4 mr-2" /> Save Entry</>}
              </Button>
              <Button variant="outline" onClick={() => setNewEntryDialog(false)} disabled={isProcessing}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission help dialog */}
      <Dialog open={showPermissionHelp} onOpenChange={setShowPermissionHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2"><Shield className="w-5 h-5 text-blue-600" /><span>Enable Microphone Access</span></DialogTitle>
            <DialogDescription>Learn how to enable microphone permissions for voice recording.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">Make sure no other applications are using your microphone and that you're on HTTPS or localhost.</p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Chrome/Edge</h4>
                <ul className="ml-6 text-sm">
                  <li>• Click the lock icon in the address bar → Site settings → Microphone → Allow</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Firefox</h4>
                <ul className="ml-6 text-sm">
                  <li>• Click the microphone icon in the address bar and allow access, optionally remember decision</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Safari</h4>
                <ul className="ml-6 text-sm">
                  <li>• Safari → Settings for This Website → Microphone → Allow</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={async () => {
                setShowPermissionHelp(false);
                toast.info('Testing microphone access...');
                const r = await testMicrophoneAccess();
                if (r.hasPermission && r.isWorking) {
                  setMicPermission('granted');
                  toast.success('Microphone OK');
                } else {
                  const sol = getMicrophoneErrorSolution(r.errorMessage || '');
                  toast.error(`${r.errorMessage}. ${sol}`);
                  if ((r.errorMessage || '').toLowerCase().includes('permission')) setMicPermission('denied');
                }
              }} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600">Test Microphone</Button>
              <Button variant="outline" onClick={() => setShowPermissionHelp(false)} className="flex-1">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* hidden audio player for playback (used by playAudio) */}
      <audio ref={audioRef} className="hidden" />

    </div>
  );
}

// ---------------- small helpers for icons/colors (reused) ----------------
function getMoodIcon(mood: string) {
  switch (mood) {
    case 'happy': return '😊';
    case 'excited': return '🤗';
    case 'calm': return '😌';
    case 'neutral': return '😐';
    case 'anxious': return '😰';
    case 'sad': return '😢';
    default: return '😐';
  }
}
function getMoodColor(mood: string) {
  switch (mood) {
    case 'happy': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'excited': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'calm': return 'bg-green-100 text-green-700 border-green-200';
    case 'neutral': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'anxious': return 'bg-red-100 text-red-700 border-red-200';
    case 'sad': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
