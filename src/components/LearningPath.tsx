import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Headphones,
  MessageCircle,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { CURRICULUM_PHASES } from '../data/curriculum';
import type {
  JLPTLevel,
  LessonNode,
  NavTab,
  UserProgress,
} from '../types/learning';
import {
  calculateJapaneseSimilarity,
  playFeedbackSound,
  speakJapanese,
  startJapaneseRecognition,
} from '../utils/speech';
import { FuriganaText } from './FuriganaText';

interface LearningPathProps {
  progress: UserProgress;
  onCompleteLesson: (lessonId: string, xpEarned: number, minutes: number) => void;
  onNavigateTab: (tab: NavTab) => void;
}

const LEVEL_BADGE_STYLES: Record<JLPTLevel, string> = {
  N5: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  N4: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
  N3: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  N2: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  N1: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
};

const PHASE_HEADER_GRADIENT: Record<string, string> = {
  emerald: 'from-emerald-600 to-teal-600',
  sky: 'from-sky-600 to-cyan-600',
  indigo: 'from-indigo-600 to-violet-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-600 to-pink-600',
};

export const LearningPath: React.FC<LearningPathProps> = ({
  progress,
  onCompleteLesson,
  onNavigateTab,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | JLPTLevel>('ALL');
  const [activeLesson, setActiveLesson] = useState<LessonNode | null>(null);

  const allLessons = CURRICULUM_PHASES.flatMap((p) => p.lessons);
  const nextLesson =
    allLessons.find((l) => !progress.completedLessons.includes(l.id)) ?? allLessons[0];

  const filteredPhases =
    selectedLevel === 'ALL'
      ? CURRICULUM_PHASES
      : CURRICULUM_PHASES.filter((p) => p.level === selectedLevel);

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Hero Today's Focus Widget (Busuu + Duolingo Hybrid) */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-rose-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Mục tiêu hôm nay · Hội thoại thực chiến
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              {nextLesson.title}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              <strong className="text-white">Can-Do:</strong> {nextLesson.canDoGoal}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setActiveLesson(nextLesson)}
                className="btn-3d inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm shadow-lg hover:bg-indigo-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-indigo-700 text-indigo-700" />
                Học ngay (+{nextLesson.xpReward} XP)
              </button>
              <button
                onClick={() => onNavigateTab('roleplay')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Thử AI Roleplay
              </button>
            </div>
          </div>

          {/* 4-Skill Quick Matrix */}
          <div className="grid grid-cols-2 gap-2.5 lg:w-72 shrink-0">
            <button
              onClick={() => onNavigateTab('shadowing')}
              className="p-3.5 rounded-2xl bg-white/12 hover:bg-white/20 backdrop-blur-sm text-left transition cursor-pointer border border-white/15"
            >
              <Headphones className="w-5 h-5 text-emerald-300 mb-1.5" />
              <div className="text-xs font-extrabold">Shadowing</div>
              <div className="text-[11px] text-indigo-100">Nói đuổi theo âm</div>
            </button>
            <button
              onClick={() => onNavigateTab('roleplay')}
              className="p-3.5 rounded-2xl bg-white/12 hover:bg-white/20 backdrop-blur-sm text-left transition cursor-pointer border border-white/15"
            >
              <MessageCircle className="w-5 h-5 text-rose-300 mb-1.5" />
              <div className="text-xs font-extrabold">Roleplay AI</div>
              <div className="text-[11px] text-indigo-100">Đóng vai thực tế</div>
            </button>
            <button
              onClick={() => onNavigateTab('pitch-kana')}
              className="p-3.5 rounded-2xl bg-white/12 hover:bg-white/20 backdrop-blur-sm text-left transition cursor-pointer border border-white/15"
            >
              <Volume2 className="w-5 h-5 text-amber-300 mb-1.5" />
              <div className="text-xs font-extrabold">Pitch Accent</div>
              <div className="text-[11px] text-indigo-100">Chuẩn ngữ điệu</div>
            </button>
            <button
              onClick={() => onNavigateTab('srs')}
              className="p-3.5 rounded-2xl bg-white/12 hover:bg-white/20 backdrop-blur-sm text-left transition cursor-pointer border border-white/15"
            >
              <BookOpen className="w-5 h-5 text-sky-300 mb-1.5" />
              <div className="text-xs font-extrabold">SRS Review</div>
              <div className="text-[11px] text-indigo-100">Nhớ sâu lâu quên</div>
            </button>
          </div>
        </div>
      </section>

      {/* Level Filter Tabs (Bunpro-inspired N5-N1 organization) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Con đường chinh phục hội thoại (N5 → N1)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mỗi bài học kết hợp Ngữ pháp cốt lõi + Hội thoại thật + Luyện phản xạ nói
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {(['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {lvl === 'ALL' ? 'Tất cả' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Phases & Winding Path Cards */}
      <div className="space-y-8">
        {filteredPhases.map((phase) => {
          const completedInPhase = phase.lessons.filter((l) =>
            progress.completedLessons.includes(l.id)
          ).length;

          return (
            <div
              key={phase.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Phase Banner */}
              <div
                className={`bg-gradient-to-r ${
                  PHASE_HEADER_GRADIENT[phase.accentColor]
                } px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-extrabold">
                      {phase.level}
                    </span>
                    <span className="text-xs text-white/85 font-medium">
                      {completedInPhase}/{phase.lessons.length} bài hoàn thành
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold">{phase.title}</h3>
                  <p className="text-xs sm:text-sm text-white/90 mt-0.5">{phase.subtitle}</p>
                </div>
                <div className="bg-black/15 px-3.5 py-2 rounded-2xl text-xs max-w-xs">
                  <span className="font-bold block text-white/80 uppercase text-[10px]">
                    Mục tiêu đầu ra
                  </span>
                  {phase.fluencyTarget}
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="p-5 sm:p-6 grid gap-4 md:grid-cols-2">
                {phase.lessons.map((lesson, idx) => {
                  const isDone = progress.completedLessons.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setActiveLesson(lesson);
                      }}
                      className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-300 dark:border-emerald-500/40'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border ${
                              LEVEL_BADGE_STYLES[lesson.level]
                            }`}
                          >
                            {lesson.level} · Nút {idx + 1}
                          </span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              Đã hoàn thành
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              +{lesson.xpReward} XP · {lesson.estimatedMinutes} phút
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {lesson.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate pr-2">
                          🎯 {lesson.canDoGoal}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {isDone ? 'Ôn lại' : 'Bắt đầu'}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Lesson Modal */}
      {activeLesson && (
        <LessonPlayerModal
          lesson={activeLesson}
          progress={progress}
          onClose={() => setActiveLesson(null)}
          onComplete={(xp, mins) => {
            onCompleteLesson(activeLesson.id, xp, mins);
            setActiveLesson(null);
          }}
        />
      )}
    </div>
  );
};

interface LessonPlayerModalProps {
  lesson: LessonNode;
  progress: UserProgress;
  onClose: () => void;
  onComplete: (xp: number, mins: number) => void;
}

const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({
  lesson,
  progress,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<'grammar' | 'dialogue' | 'quiz' | 'done'>('grammar');
  const [exIndex, setExIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [checkedStatus, setCheckedStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const currentExercise = lesson.exercises[exIndex];

  const resetExerciseState = () => {
    setSelectedChoice(null);
    setBuiltWords([]);
    setCheckedStatus('idle');
    setSpokenText(null);
    setSpeechScore(null);
    setMicError(null);
  };

  const handleCheckExercise = () => {
    if (!currentExercise) return;
    let isRight = false;

    if (currentExercise.type === 'listen-choose' || currentExercise.type === 'fill-particle') {
      isRight = selectedChoice === currentExercise.correctAnswer;
    } else if (currentExercise.type === 'build-sentence') {
      isRight = builtWords.join(' ') === currentExercise.correctAnswer;
    } else if (currentExercise.type === 'speak-repeat') {
      isRight = (speechScore ?? 0) >= 55;
    }

    if (isRight) {
      setCheckedStatus('correct');
      setCorrectCount((c) => c + 1);
      playFeedbackSound('correct', progress.soundEnabled);
    } else {
      setCheckedStatus('wrong');
      playFeedbackSound('wrong', progress.soundEnabled);
    }
  };

  const handleNextExercise = () => {
    if (exIndex + 1 < lesson.exercises.length) {
      setExIndex((i) => i + 1);
      resetExerciseState();
    } else {
      setStep('done');
      playFeedbackSound('complete', progress.soundEnabled);
    }
  };

  const handleVoicePractice = () => {
    if (!currentExercise) return;
    setMicError(null);
    setIsListening(true);
    startJapaneseRecognition({
      onResult: (transcript) => {
        setSpokenText(transcript);
        const score = calculateJapaneseSimilarity(currentExercise.correctAnswer, transcript);
        setSpeechScore(score);
        if (score >= 55) {
          setCheckedStatus('correct');
          setCorrectCount((c) => c + 1);
          playFeedbackSound('correct', progress.soundEnabled);
        } else {
          setCheckedStatus('wrong');
          playFeedbackSound('wrong', progress.soundEnabled);
        }
      },
      onError: (err) => {
        setMicError(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold border shrink-0 ${
                LEVEL_BADGE_STYLES[lesson.level]
              }`}
            >
              {lesson.level}
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {lesson.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            aria-label="Close lesson"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Tabs */}
        {step !== 'done' && (
          <div className="px-5 sm:px-7 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex gap-2">
            {[
              { id: 'grammar', label: '1. Ngữ pháp (Tip-Sheet)' },
              { id: 'dialogue', label: '2. Hội thoại mẫu' },
              { id: 'quiz', label: `3. Thực hành (${exIndex + 1}/${lesson.exercises.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setStep(t.id as 'grammar' | 'dialogue' | 'quiz')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  step === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          {step === 'grammar' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
                <div className="text-xs font-extrabold uppercase text-indigo-700 dark:text-indigo-300 mb-1">
                  🎯 Mục tiêu bài học (Can-Do)
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {lesson.canDoGoal}
                </p>
              </div>

              {lesson.grammarTips.map((tip, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-jp font-extrabold text-lg text-indigo-700 dark:text-indigo-300">
                      {tip.pattern}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {tip.meaning}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {tip.explanation}
                  </p>
                  <div className="space-y-2 pt-1">
                    {tip.examples.map((ex, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700"
                      >
                        <div>
                          <div className="text-base font-bold text-slate-900 dark:text-white">
                            <FuriganaText
                              tokens={ex.tokens}
                              showFurigana={progress.showFurigana}
                            />
                          </div>
                          {progress.showRomaji && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {ex.romaji}
                            </div>
                          )}
                          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                            → {ex.vi}
                          </div>
                        </div>
                        <button
                          onClick={() => speakJapanese(ex.plain)}
                          className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition shrink-0 cursor-pointer"
                          title="Nghe phát âm mẫu"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {tip.nuanceTip && (
                    <div className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30">
                      💡 <strong>Mẹo bản xứ:</strong> {tip.nuanceTip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 'dialogue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Bấm biểu tượng loa ở từng câu để nghe giọng Nhật chuẩn & nhẩm theo.
                </p>
              </div>
              {lesson.dialogue.map((line) => (
                <div
                  key={line.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 flex gap-3.5 items-start"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0">
                    {line.avatarEmoji}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {line.speaker}
                        </span>
                        <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
                          {line.role}
                        </span>
                      </div>
                      <button
                        onClick={() => speakJapanese(line.plain)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-200 transition cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Nghe
                      </button>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      <FuriganaText
                        tokens={line.tokens}
                        showFurigana={progress.showFurigana}
                      />
                    </div>
                    {progress.showRomaji && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {line.romaji}
                      </div>
                    )}
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      “{line.vi}”
                    </div>
                    {line.naturalContraction && (
                      <div className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold pt-1">
                        ⚡ Khẩu ngữ nói nhanh: {line.naturalContraction}
                      </div>
                    )}
                    {line.culturalNote && (
                      <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg mt-1.5">
                        🇯🇵 {line.culturalNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'quiz' && currentExercise && (
            <div className="space-y-5">
              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300"
                  style={{
                    width: `${((exIndex + (checkedStatus === 'correct' ? 1 : 0)) / lesson.exercises.length) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {currentExercise.type === 'listen-choose' && '🎧 Nghe & chọn nghĩa'}
                  {currentExercise.type === 'fill-particle' && '🧩 Chọn trợ từ / từ đúng'}
                  {currentExercise.type === 'build-sentence' && '🧱 Ghép câu tiếng Nhật'}
                  {currentExercise.type === 'speak-repeat' && '🎙️ Luyện nói trực tiếp'}
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {currentExercise.promptVi}
                </h4>
              </div>

              {/* Audio Play Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => speakJapanese(currentExercise.audioText)}
                  className="btn-3d inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Nghe mẫu (1.0x)
                </button>
                <button
                  onClick={() => speakJapanese(currentExercise.audioText, { rate: 0.7 })}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  🐢 Nghe chậm (0.7x)
                </button>
              </div>

              {currentExercise.promptJp && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-jp text-xl font-bold text-center text-slate-900 dark:text-white">
                  {currentExercise.promptJp}
                </div>
              )}

              {/* Listen Choose or Fill Particle */}
              {(currentExercise.type === 'listen-choose' ||
                currentExercise.type === 'fill-particle') &&
                currentExercise.choices && (
                  <div className="grid gap-2.5">
                    {currentExercise.choices.map((choice) => {
                      const isSelected = selectedChoice === choice;
                      return (
                        <button
                          key={choice}
                          disabled={checkedStatus !== 'idle'}
                          onClick={() => setSelectedChoice(choice)}
                          className={`p-4 rounded-2xl border-2 text-left font-semibold text-sm transition cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                )}

              {/* Build Sentence */}
              {currentExercise.type === 'build-sentence' && currentExercise.wordBank && (
                <div className="space-y-4">
                  <div className="min-h-16 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-2 items-center">
                    {builtWords.length === 0 ? (
                      <span className="text-xs text-slate-400">
                        Bấm vào các thẻ bên dưới để ghép thành câu tiếng Nhật...
                      </span>
                    ) : (
                      builtWords.map((w, idx) => (
                        <button
                          key={`${w}-${idx}`}
                          disabled={checkedStatus !== 'idle'}
                          onClick={() =>
                            setBuiltWords((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-jp font-bold text-sm shadow-xs cursor-pointer"
                        >
                          {w}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.wordBank.map((word) => {
                      const used = builtWords.includes(word);
                      return (
                        <button
                          key={word}
                          disabled={used || checkedStatus !== 'idle'}
                          onClick={() => setBuiltWords((prev) => [...prev, word])}
                          className={`px-3.5 py-2 rounded-xl border-2 font-jp font-bold text-sm transition cursor-pointer ${
                            used
                              ? 'opacity-35 border-slate-200 dark:border-slate-800'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-900 dark:text-white'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Speak Repeat */}
              {currentExercise.type === 'speak-repeat' && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                  {currentExercise.tokens && (
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                      <FuriganaText
                        tokens={currentExercise.tokens}
                        showFurigana={progress.showFurigana}
                      />
                    </div>
                  )}
                  {progress.showRomaji && currentExercise.romaji && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {currentExercise.romaji}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleVoicePractice}
                      disabled={isListening}
                      className={`btn-3d inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm cursor-pointer ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-rose-500 hover:bg-rose-600 text-white'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      {isListening ? 'Đang nghe bạn nói tiếng Nhật...' : 'Bấm để nói vào Micro'}
                    </button>

                    <button
                      onClick={() => {
                        setSpeechScore(90);
                        setCheckedStatus('correct');
                        setCorrectCount((c) => c + 1);
                        playFeedbackSound('correct', progress.soundEnabled);
                      }}
                      className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Tôi đã tự đọc to ✓
                    </button>
                  </div>

                  {spokenText && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm">
                      <div>
                        Micro nghe được: <strong className="font-jp">{spokenText}</strong>
                      </div>
                      <div>
                        Độ khớp phát âm:{' '}
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          {speechScore}%
                        </strong>
                      </div>
                    </div>
                  )}
                  {micError && (
                    <p className="text-xs text-amber-700 dark:text-amber-300">{micError}</p>
                  )}
                </div>
              )}

              {/* Feedback Banner */}
              {checkedStatus !== 'idle' && (
                <div
                  className={`p-4 rounded-2xl border-2 ${
                    checkedStatus === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-500/15 border-rose-400 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="font-extrabold text-sm mb-1">
                    {checkedStatus === 'correct'
                      ? '🎉 Chính xác! Tuyệt vời!'
                      : `💡 Chưa chuẩn lắm — Đáp án: ${currentExercise.correctAnswer}`}
                  </div>
                  <p className="text-xs leading-relaxed">{currentExercise.explanationVi}</p>
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Hoàn thành xuất sắc!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Bạn đã hoàn thành <strong>{lesson.title}</strong> ({correctCount}/
                {lesson.exercises.length} câu chuẩn xác) và mở khóa kỹ năng giao tiếp mới.
              </p>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm">
                +{lesson.xpReward} XP · +{lesson.estimatedMinutes} phút học
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
          {step === 'grammar' && (
            <>
              <span className="text-xs text-slate-500">Bước 1/3 · Đọc kỹ mẹo bản xứ</span>
              <button
                onClick={() => setStep('dialogue')}
                className="btn-3d inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 cursor-pointer"
              >
                Sang hội thoại mẫu
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'dialogue' && (
            <>
              <button
                onClick={() => setStep('grammar')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                ← Xem lại ngữ pháp
              </button>
              <button
                onClick={() => {
                  setExIndex(0);
                  resetExerciseState();
                  setStep('quiz');
                }}
                className="btn-3d inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 cursor-pointer"
              >
                Vào thực hành ngay
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'quiz' && currentExercise && (
            <>
              <button
                onClick={resetExerciseState}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm lại câu này
              </button>

              {checkedStatus === 'idle' ? (
                <button
                  onClick={handleCheckExercise}
                  disabled={
                    (currentExercise.type === 'listen-choose' ||
                      currentExercise.type === 'fill-particle') &&
                    !selectedChoice
                  }
                  className="btn-3d px-6 py-2.5 rounded-2xl bg-indigo-600 disabled:opacity-40 text-white font-extrabold text-sm hover:bg-indigo-700 cursor-pointer"
                >
                  Kiểm tra
                </button>
              ) : (
                <button
                  onClick={handleNextExercise}
                  className="btn-3d inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 cursor-pointer"
                >
                  {exIndex + 1 < lesson.exercises.length ? 'Câu tiếp theo' : 'Hoàn thành bài'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {step === 'done' && (
            <div className="w-full flex justify-end">
              <button
                onClick={() => onComplete(lesson.xpReward, lesson.estimatedMinutes)}
                className="btn-3d px-6 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 cursor-pointer"
              >
                Nhận {lesson.xpReward} XP & Tiếp tục
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
