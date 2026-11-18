import React from 'react';
import { Flame, Moon, Sun, Volume2, VolumeX, Zap } from 'lucide-react';
import type { UserProgress } from '../types/learning';

interface TopStatsBarProps {
  progress: UserProgress;
  onToggleDark: () => void;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onToggleSound: () => void;
}

export const TopStatsBar: React.FC<TopStatsBarProps> = ({
  progress,
  onToggleDark,
  onToggleFurigana,
  onToggleRomaji,
  onToggleSound,
}) => {
  const goalPct = Math.min(
    100,
    Math.round((progress.dailyMinutes / Math.max(1, progress.dailyGoalMinutes)) * 100)
  );

  const estimatedLevel =
    progress.xp >= 500
      ? 'N2–N1'
      : progress.xp >= 320
      ? 'N3'
      : progress.xp >= 180
      ? 'N4'
      : 'N5';

  return (
    <header className="sticky top-0 z-30 bg-[#faf8f5]/90 dark:bg-[#0f121e]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Mobile Brand + Stats */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="lg:hidden flex items-center gap-2 mr-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center text-white font-jp font-extrabold text-sm">
              言
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              KotoPath
            </span>
          </div>

          {/* Streak */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/30"
            title="Chuỗi ngày học liên tiếp"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-300">
              {progress.streak} ngày
            </span>
          </div>

          {/* XP */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30"
            title="Tổng điểm kinh nghiệm XP"
          >
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600/20" />
            <span className="text-xs sm:text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
              {progress.xp} XP
            </span>
          </div>

          {/* Level Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Cấp độ: {estimatedLevel}
            </span>
          </div>
        </div>

        {/* Daily Goal + Quick Study Toggles */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Daily Goal Mini Progress */}
          <div className="hidden md:flex items-center gap-2 mr-2 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Hôm nay: {progress.dailyMinutes}/{progress.dailyGoalMinutes}p
            </span>
            <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>

          {/* Furigana Toggle */}
          <button
            onClick={onToggleFurigana}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              progress.showFurigana
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Bật/tắt phiên âm Hiragana trên Kanji"
          >
            振り仮名
          </button>

          {/* Romaji Toggle */}
          <button
            onClick={onToggleRomaji}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              progress.showRomaji
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Bật/tắt phiên âm Latinh (Romaji)"
          >
            Romaji
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Bật/tắt hiệu ứng âm thanh"
            aria-label="Toggle sound"
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Chế độ Sáng / Tối"
            aria-label="Toggle dark mode"
          >
            {progress.darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
