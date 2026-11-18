import React, { useEffect, useRef, useState } from 'react';
import {
  AudioLines,
  Mic,
  Pause,
  Play,
  Repeat,
  Square,
  Volume2,
} from 'lucide-react';
import { SHADOWING_TRACKS } from '../data/shadowing';
import type { UserProgress } from '../types/learning';
import {
  calculateJapaneseSimilarity,
  playFeedbackSound,
  speakJapanese,
  startJapaneseRecognition,
  stopJapaneseSpeech,
} from '../utils/speech';
import { FuriganaText } from './FuriganaText';

interface ShadowingStudioProps {
  progress: UserProgress;
  onLogShadowing: (xp: number, minutes: number) => void;
}

type ShadowMode = 'listen' | 'whisper' | 'shadow';

export const ShadowingStudio: React.FC<ShadowingStudioProps> = ({
  progress,
  onLogShadowing,
}) => {
  const [trackIdx, setTrackIdx] = useState(0);
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [speed, setSpeed] = useState(0.95);
  const [loopLine, setLoopLine] = useState(false);
  const [mode, setMode] = useState<ShadowMode>('shadow');
  const [isPlaying, setIsPlaying] = useState(false);

  // User Mic / Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [micNote, setMicNote] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const loopRef = useRef(loopLine);

  useEffect(() => {
    loopRef.current = loopLine;
  }, [loopLine]);

  const track = SHADOWING_TRACKS[trackIdx];
  const currentLine = track.lines[activeLineIdx] ?? track.lines[0];

  useEffect(() => {
    return () => {
      stopJapaneseSpeech();
    };
  }, []);

  const playLine = (idx: number, autoContinue = false) => {
    const line = track.lines[idx];
    if (!line) {
      setIsPlaying(false);
      return;
    }
    setActiveLineIdx(idx);
    setIsPlaying(true);

    speakJapanese(line.plain, {
      rate: speed,
      onEnd: () => {
        if (loopRef.current) {
          setTimeout(() => playLine(idx, autoContinue), 500);
        } else if (autoContinue && idx + 1 < track.lines.length) {
          setTimeout(() => playLine(idx + 1, true), 650);
        } else {
          setIsPlaying(false);
        }
      },
      onError: () => setIsPlaying(false),
    });
  };

  const handleStopPlay = () => {
    stopJapaneseSpeech();
    setIsPlaying(false);
  };

  const handleSelectTrack = (idx: number) => {
    handleStopPlay();
    setTrackIdx(idx);
    setActiveLineIdx(0);
    setRecordedUrl(null);
    setTranscript(null);
    setAccuracy(null);
  };

  const handleStartShadowMic = async () => {
    setMicNote(null);
    setTranscript(null);
    setAccuracy(null);

    // 1. Optional MediaRecorder so user can hear their own voice
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedUrl(url);
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      } catch {
        setMicNote('Không thể truy cập micro để ghi âm phát lại.');
      }
    }

    // 2. Simultaneously play native voice softly/at speed in shadow mode & start SpeechRecognition
    setIsRecording(true);
    const stopRec = startJapaneseRecognition({
      onResult: (text) => {
        setTranscript(text);
        const score = calculateJapaneseSimilarity(currentLine.plain, text);
        setAccuracy(score);
        if (score >= 60) {
          playFeedbackSound('correct', progress.soundEnabled);
          onLogShadowing(15, 2);
        }
      },
      onError: (err) => setMicNote(err),
      onEnd: () => {
        setIsRecording(false);
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      },
    });

    if (!stopRec) {
      setIsRecording(false);
    }
  };

  const handleStopShadowMic = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <AudioLines className="w-4 h-4" />
            Shadowing Studio · Luyện nói đuổi
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Bắt nhịp ngữ điệu người bản xứ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nghe và lặp lại trễ hơn giọng mẫu 0.5 giây để rèn cơ miệng và phản xạ tự nhiên.
          </p>
        </div>

        {/* 3-Step Shadowing Method Selector */}
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {[
            { id: 'listen', label: '1. Nghe hiểu' },
            { id: 'whisper', label: '2. Nhẩm theo' },
            { id: 'shadow', label: '3. Nói đuổi 100%' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as ShadowMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === m.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Track Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SHADOWING_TRACKS.map((t, i) => {
          const selected = i === trackIdx;
          return (
            <button
              key={t.id}
              onClick={() => handleSelectTrack(i)}
              className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer ${
                selected
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-500/15 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-500/25 dark:text-indigo-300">
                  {t.level}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.durationLabel}
                </span>
              </div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                {t.title}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {t.speedTag}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Panel */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Split Waveform + Controls + Recorder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                Dual Waveform Monitor
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Câu {activeLineIdx + 1}/{track.lines.length}
              </span>
            </div>

            {/* Dual Split Waveforms */}
            <div className="space-y-3">
              {/* Native Wave */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60">
                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-2 flex justify-between">
                  <span>🇯🇵 Giọng bản xứ (Native Track)</span>
                  <span>{speed}x</span>
                </div>
                <div className="h-10 flex items-center justify-between gap-1">
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all ${
                        isPlaying ? 'wave-bar' : 'opacity-35'
                      }`}
                      style={{
                        height: `${28 + ((idx * 17) % 70)}%`,
                        animationDelay: `${idx * 45}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* User Mic Wave */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60">
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex justify-between">
                  <span>🎙️ Giọng của bạn (Your Voice)</span>
                  <span>{isRecording ? 'Đang thu...' : 'Sẵn sàng'}</span>
                </div>
                <div className="h-10 flex items-center justify-between gap-1">
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all ${
                        isRecording ? 'wave-bar' : 'opacity-30'
                      }`}
                      style={{
                        height: `${24 + ((idx * 23) % 72)}%`,
                        animationDelay: `${idx * 55}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Playback & Speed Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {isPlaying ? (
                <button
                  onClick={handleStopPlay}
                  className="btn-3d flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 text-white font-extrabold text-sm cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  Dừng phát
                </button>
              ) : (
                <button
                  onClick={() => playLine(activeLineIdx, true)}
                  className="btn-3d flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Phát cả đoạn
                </button>
              )}

              <button
                onClick={() => setLoopLine((v) => !v)}
                className={`px-3.5 py-3 rounded-2xl border-2 text-xs font-extrabold inline-flex items-center gap-1.5 transition cursor-pointer ${
                  loopLine
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="Lặp lại câu hiện tại"
              >
                <Repeat className="w-4 h-4" />
                Lặp câu
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Tốc độ đọc:
              </span>
              <div className="flex gap-1.5">
                {[0.65, 0.8, 0.95, 1.1].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeed(spd)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      speed === spd
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Mic Recording CTA */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {!isRecording ? (
                <button
                  onClick={handleStartShadowMic}
                  className="btn-3d w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm cursor-pointer shadow-md shadow-rose-500/20"
                >
                  <Mic className="w-4 h-4" />
                  Ghi âm & Chấm điểm câu {activeLineIdx + 1}
                </button>
              ) : (
                <button
                  onClick={handleStopShadowMic}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold text-sm cursor-pointer animate-pulse"
                >
                  <Square className="w-4 h-4 fill-rose-500 text-rose-500" />
                  Đang thu... Bấm để dừng
                </button>
              )}

              {recordedUrl && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Nghe lại giọng thu của bạn:
                  </div>
                  <audio controls src={recordedUrl} className="w-full h-8" />
                </div>
              )}

              {transcript && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs space-y-1">
                  <div>
                    Nhận diện: <strong className="font-jp text-sm">{transcript}</strong>
                  </div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">
                    Độ chính xác: {accuracy}% {accuracy && accuracy >= 75 ? '🌟 Tuyệt vời!' : '💪 Thử lại lần nữa nhé!'}
                  </div>
                </div>
              )}

              {micNote && (
                <p className="text-xs text-amber-700 dark:text-amber-300">{micNote}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Karaoke Subtitle Lines */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              Bối cảnh luyện tập
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{track.situation}</p>
          </div>

          <div className="space-y-3">
            {track.lines.map((line, idx) => {
              const isCurrent = idx === activeLineIdx;
              return (
                <div
                  key={line.id}
                  onClick={() => playLine(idx, false)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') playLine(idx, false);
                  }}
                  className={`p-5 rounded-3xl border-2 transition cursor-pointer ${
                    isCurrent
                      ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {line.speaker}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Volume2 className="w-3.5 h-3.5" />
                      Nghe câu này
                    </span>
                  </div>

                  <div
                    className={`text-xl font-extrabold transition ${
                      mode === 'listen' && !isCurrent
                        ? 'blur-[3px] hover:blur-none'
                        : ''
                    } text-slate-900 dark:text-white`}
                  >
                    <FuriganaText
                      tokens={line.tokens}
                      showFurigana={progress.showFurigana}
                    />
                  </div>

                  {progress.showRomaji && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {line.romaji}
                    </div>
                  )}

                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-1.5">
                    {line.vi}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between text-[11px]">
                    <span className="font-jp text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-1 rounded-lg">
                      🎵 Nhịp & Trọng âm: {line.pitchCue}
                    </span>
                    {line.contractionNote && (
                      <span className="text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        💡 {line.contractionNote}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
