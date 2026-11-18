import type { SRSState, UserProgress } from '../types/learning';

const STORAGE_KEY = 'kotopath_progress_v1';

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DEFAULT_PROGRESS: UserProgress = {
  xp: 120,
  streak: 1,
  lastActiveDate: getTodayIso(),
  dailyMinutes: 10,
  dailyGoalMinutes: 30,
  completedLessons: [],
  completedRoleplays: [],
  shadowingMinutes: 5,
  srsStates: {},
  canDoChecked: ['cando-n5-1'],
  darkMode: false,
  showFurigana: true,
  showRomaji: true,
  soundEnabled: true,
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    const today = getTodayIso();

    let streak = parsed.streak ?? 1;
    let dailyMinutes = parsed.dailyMinutes ?? 0;

    if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
      const prev = new Date(parsed.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
      dailyMinutes = 0;
    }

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      streak,
      dailyMinutes,
      lastActiveDate: today,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage quota errors
  }
}

export function resetProgress(): UserProgress {
  const fresh: UserProgress = {
    ...DEFAULT_PROGRESS,
    lastActiveDate: getTodayIso(),
  };
  saveProgress(fresh);
  return fresh;
}

// SM-2 inspired SRS scheduler
export function computeNextSRSState(
  current: SRSState | undefined,
  rating: 'again' | 'hard' | 'good' | 'easy'
): SRSState {
  const now = Date.now();
  const prevInterval = current?.intervalDays ?? 0;
  const prevEase = current?.ease ?? 2.5;
  const prevReps = current?.reps ?? 0;

  let intervalDays = 1;
  let ease = prevEase;
  let reps = prevReps;

  if (rating === 'again') {
    reps = 0;
    intervalDays = 0.01; // ~15 minutes later
    ease = Math.max(1.3, prevEase - 0.2);
  } else if (rating === 'hard') {
    reps = prevReps + 1;
    intervalDays = prevInterval <= 1 ? 1 : Math.round(prevInterval * 1.2);
    ease = Math.max(1.3, prevEase - 0.15);
  } else if (rating === 'good') {
    reps = prevReps + 1;
    if (prevReps === 0) intervalDays = 1;
    else if (prevReps === 1) intervalDays = 3;
    else intervalDays = Math.round(prevInterval * prevEase);
  } else {
    // easy
    reps = prevReps + 1;
    if (prevReps === 0) intervalDays = 4;
    else intervalDays = Math.round(Math.max(2, prevInterval) * prevEase * 1.3);
    ease = Math.min(3.0, prevEase + 0.15);
  }

  return {
    intervalDays,
    ease,
    reps,
    dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
  };
}
