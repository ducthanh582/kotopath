export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type NavTab =
  | 'path'
  | 'shadowing'
  | 'roleplay'
  | 'pitch-kana'
  | 'srs'
  | 'roadmap';

export type PitchPatternType = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka';

export interface FuriganaToken {
  text: string;
  reading?: string; // Hiragana reading if text contains Kanji
}

export interface GrammarTip {
  pattern: string;
  meaning: string;
  explanation: string;
  examples: {
    tokens: FuriganaToken[];
    plain: string;
    romaji: string;
    vi: string;
  }[];
  nuanceTip?: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  role: string;
  avatarEmoji: string;
  tokens: FuriganaToken[];
  plain: string;
  romaji: string;
  vi: string;
  culturalNote?: string;
  naturalContraction?: string;
}

export interface ExerciseItem {
  id: string;
  type: 'listen-choose' | 'build-sentence' | 'fill-particle' | 'speak-repeat';
  promptVi: string;
  promptJp?: string;
  tokens?: FuriganaToken[];
  romaji?: string;
  audioText: string;
  choices?: string[];
  wordBank?: string[];
  correctAnswer: string;
  explanationVi: string;
}

export interface LessonNode {
  id: string;
  title: string;
  subtitle: string;
  level: JLPTLevel;
  canDoGoal: string;
  estimatedMinutes: number;
  xpReward: number;
  grammarTips: GrammarTip[];
  dialogue: DialogueLine[];
  exercises: ExerciseItem[];
}

export interface CurriculumPhase {
  id: string;
  level: JLPTLevel;
  title: string;
  subtitle: string;
  fluencyTarget: string;
  accentColor: string;
  lessons: LessonNode[];
}

export interface ShadowingLine {
  id: string;
  speaker: string;
  tokens: FuriganaToken[];
  plain: string;
  romaji: string;
  vi: string;
  pitchCue: string;
  contractionNote?: string;
}

export interface ShadowingTrack {
  id: string;
  title: string;
  level: JLPTLevel;
  situation: string;
  speedTag: string;
  durationLabel: string;
  lines: ShadowingLine[];
}

export interface RoleplayHint {
  tone: 'Thân mật (Tameguchi)' | 'Lịch sự (Teineigo)' | 'Tự nhiên / Keigo';
  tokens: FuriganaToken[];
  plain: string;
  romaji: string;
  vi: string;
}

export interface RoleplayStep {
  id: string;
  partnerTokens: FuriganaToken[];
  partnerPlain: string;
  partnerRomaji: string;
  partnerVi: string;
  hints: RoleplayHint[];
  expectedKeywords: string[];
  feedbackNatural: string;
  grammarCheckTip: string;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  level: JLPTLevel;
  setting: string;
  formality: string;
  partnerName: string;
  partnerRole: string;
  partnerAvatar: string;
  missionVi: string;
  steps: RoleplayStep[];
}

export interface PitchPairItem {
  id: string;
  kana: string;
  morae: string[];
  wordA: {
    kanji: string;
    romaji: string;
    meaningVi: string;
    pattern: PitchPatternType;
    dropAfter: number; // 0 = Heiban (flat, L-H-H...), 1 = drop after mora 1 (H-L-L...), etc.
    exampleVi: string;
    exampleJp: string;
  };
  wordB: {
    kanji: string;
    romaji: string;
    meaningVi: string;
    pattern: PitchPatternType;
    dropAfter: number;
    exampleVi: string;
    exampleJp: string;
  };
}

export interface KanaChar {
  hiragana: string;
  katakana: string;
  romaji: string;
  row: string;
  mnemonic: string;
}

export interface SRSCardItem {
  id: string;
  level: JLPTLevel;
  category: 'Giao tiếp' | 'Ngữ pháp nói' | 'Từ vựng cốt lõi' | 'Keigo';
  tokens: FuriganaToken[];
  plain: string;
  romaji: string;
  vi: string;
  contextExampleJp: string;
  contextExampleVi: string;
  note: string;
}

export interface SRSState {
  intervalDays: number;
  ease: number;
  reps: number;
  dueAt: number; // epoch ms
}

export interface CanDoMilestone {
  id: string;
  level: JLPTLevel;
  category: 'Nghe' | 'Nói' | 'Shadowing' | 'Phản xạ thực tế';
  textVi: string;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyMinutes: number;
  dailyGoalMinutes: number;
  completedLessons: string[];
  completedRoleplays: string[];
  shadowingMinutes: number;
  srsStates: Record<string, SRSState>;
  canDoChecked: string[];
  darkMode: boolean;
  showFurigana: boolean;
  showRomaji: boolean;
  soundEnabled: boolean;
}
