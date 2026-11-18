// Japanese TTS, Sound Effects, and Speech Recognition utilities

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function getBestJapaneseVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  const jpVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ja'));
  if (!jpVoices.length) return null;
  // Prefer Google / Microsoft / Kyoko / Otoya / Nanami natural voices
  const preferred = jpVoices.find((v) =>
    /google|nanami|keita|kyoko|otoya|haruka|ayumi|sayaka|natural/i.test(v.name)
  );
  return preferred || jpVoices[0];
}

export function speakJapanese(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = options?.pitch ?? 1.0;

  const voice = getBestJapaneseVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onError?.();

  window.speechSynthesis.speak(utterance);
}

export function stopJapaneseSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Micro-interaction sound effects (Duolingo-style crisp audio feedback using Web Audio API)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playFeedbackSound(type: 'correct' | 'wrong' | 'complete', enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const playTone = (freq: number, start: number, duration: number, oscType: OscillatorType = 'sine', gainVal = 0.12) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  };

  if (type === 'correct') {
    playTone(587.33, now, 0.12, 'triangle', 0.14); // D5
    playTone(880.0, now + 0.09, 0.22, 'triangle', 0.15); // A5
  } else if (type === 'wrong') {
    playTone(240, now, 0.14, 'sawtooth', 0.06);
    playTone(195, now + 0.11, 0.18, 'sawtooth', 0.06);
  } else if (type === 'complete') {
    playTone(523.25, now, 0.12, 'triangle', 0.12); // C5
    playTone(659.25, now + 0.1, 0.12, 'triangle', 0.12); // E5
    playTone(783.99, now + 0.2, 0.14, 'triangle', 0.13); // G5
    playTone(1046.5, now + 0.32, 0.35, 'triangle', 0.15); // C6
  }
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  );
}

export function startJapaneseRecognition(callbacks: {
  onResult: (transcript: string, confidence: number) => void;
  onError: (err: string) => void;
  onEnd: () => void;
}): (() => void) | null {
  if (typeof window === 'undefined') return null;
  const SR =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
      .webkitSpeechRecognition;

  if (!SR) {
    callbacks.onError('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API (khuyên dùng Chrome/Edge).');
    callbacks.onEnd();
    return null;
  }

  const recognition = new SR();
  recognition.lang = 'ja-JP';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEventLike) => {
    const res = event.results?.[0]?.[0];
    if (res) {
      callbacks.onResult(res.transcript, res.confidence ?? 0.85);
    }
  };

  recognition.onerror = (event: { error?: string }) => {
    const msg =
      event.error === 'not-allowed'
        ? 'Bạn chưa cấp quyền Micro cho trình duyệt.'
        : event.error === 'no-speech'
        ? 'Không nghe thấy giọng nói, hãy thử nói gần micro hơn.'
        : `Lỗi nhận diện giọng nói: ${event.error ?? 'unknown'}`;
    callbacks.onError(msg);
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  recognition.start();
  return () => {
    try {
      recognition.stop();
    } catch {
      // ignore
    }
  };
}

interface SpeechRecognitionEventLike {
  results?: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence?: number;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

// Compute Japanese text similarity (character overlap / normalized Levenshtein)
export function calculateJapaneseSimilarity(expected: string, actual: string): number {
  const clean = (s: string) =>
    s
      .replace(/[\s。、！？「」『』・,.!?ー〜～]/g, '')
      .trim()
      .toLowerCase();

  const a = clean(expected);
  const b = clean(actual);
  if (!a || !b) return 0;
  if (a === b) return 100;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const dist = matrix[a.length][b.length];
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
}
