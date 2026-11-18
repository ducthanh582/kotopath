import { useEffect, useMemo, useState } from 'react';
import { FluencyRoadmap } from './components/FluencyRoadmap';
import { LearningPath } from './components/LearningPath';
import { PitchAndKanaLab } from './components/PitchAndKanaLab';
import { RoleplayArena } from './components/RoleplayArena';
import { ShadowingStudio } from './components/ShadowingStudio';
import { Sidebar } from './components/Sidebar';
import { SRSReviewDeck } from './components/SRSReviewDeck';
import { TopStatsBar } from './components/TopStatsBar';
import { CURRICULUM_PHASES } from './data/curriculum';
import { SRS_CARDS } from './data/srsDeck';
import type { NavTab, UserProgress } from './types/learning';
import {
  computeNextSRSState,
  loadProgress,
  resetProgress,
  saveProgress,
} from './utils/storage';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('path');
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    saveProgress(progress);
    const root = document.documentElement;
    if (progress.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress]);

  const totalLessonsCount = useMemo(
    () => CURRICULUM_PHASES.reduce((acc, p) => acc + p.lessons.length, 0),
    []
  );

  const dueSrsCount = useMemo(() => {
    return SRS_CARDS.filter((c) => {
      const state = progress.srsStates[c.id];
      return !state || state.dueAt <= currentTime;
    }).length;
  }, [progress.srsStates, currentTime]);

  const handleCompleteLesson = (lessonId: string, xpEarned: number, minutes: number) => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      dailyMinutes: prev.dailyMinutes + minutes,
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
    }));
  };

  const handleLogShadowing = (xp: number, minutes: number) => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xp,
      dailyMinutes: prev.dailyMinutes + minutes,
      shadowingMinutes: prev.shadowingMinutes + minutes,
    }));
  };

  const handleCompleteRoleplay = (scenarioId: string, xp: number) => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xp,
      dailyMinutes: prev.dailyMinutes + 5,
      completedRoleplays: prev.completedRoleplays.includes(scenarioId)
        ? prev.completedRoleplays
        : [...prev.completedRoleplays, scenarioId],
    }));
  };

  const handleGainXp = (xp: number) => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xp,
      dailyMinutes: prev.dailyMinutes + 1,
    }));
  };

  const handleRateSrs = (
    cardId: string,
    rating: 'again' | 'hard' | 'good' | 'easy'
  ) => {
    setCurrentTime(Date.now());
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + (rating === 'again' ? 2 : 10),
      dailyMinutes: prev.dailyMinutes + 1,
      srsStates: {
        ...prev.srsStates,
        [cardId]: computeNextSRSState(prev.srsStates[cardId], rating),
      },
    }));
  };

  const handleToggleCanDo = (id: string) => {
    setProgress((prev) => {
      const exists = prev.canDoChecked.includes(id);
      return {
        ...prev,
        canDoChecked: exists
          ? prev.canDoChecked.filter((item) => item !== id)
          : [...prev.canDoChecked, id],
      };
    });
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f5] dark:bg-[#0f121e] text-slate-900 dark:text-slate-100">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        dueSrsCount={dueSrsCount}
        completedLessonsCount={progress.completedLessons.length}
        totalLessonsCount={totalLessonsCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopStatsBar
          progress={progress}
          onToggleDark={() =>
            setProgress((p) => ({ ...p, darkMode: !p.darkMode }))
          }
          onToggleFurigana={() =>
            setProgress((p) => ({ ...p, showFurigana: !p.showFurigana }))
          }
          onToggleRomaji={() =>
            setProgress((p) => ({ ...p, showRomaji: !p.showRomaji }))
          }
          onToggleSound={() =>
            setProgress((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
          }
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto">
          {activeTab === 'path' && (
            <LearningPath
              progress={progress}
              onCompleteLesson={handleCompleteLesson}
              onNavigateTab={setActiveTab}
            />
          )}
          {activeTab === 'shadowing' && (
            <ShadowingStudio
              progress={progress}
              onLogShadowing={handleLogShadowing}
            />
          )}
          {activeTab === 'roleplay' && (
            <RoleplayArena
              progress={progress}
              onCompleteRoleplay={handleCompleteRoleplay}
            />
          )}
          {activeTab === 'pitch-kana' && (
            <PitchAndKanaLab progress={progress} onGainXp={handleGainXp} />
          )}
          {activeTab === 'srs' && (
            <SRSReviewDeck progress={progress} onRateCard={handleRateSrs} />
          )}
          {activeTab === 'roadmap' && (
            <FluencyRoadmap
              progress={progress}
              onToggleCanDo={handleToggleCanDo}
              onChangeDailyGoal={(mins) =>
                setProgress((p) => ({ ...p, dailyGoalMinutes: mins }))
              }
              onResetProgress={() => setProgress(resetProgress())}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
