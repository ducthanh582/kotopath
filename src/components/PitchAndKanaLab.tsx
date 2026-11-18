import React, { useState } from 'react';
import { HelpCircle, Sparkles, Volume2 } from 'lucide-react';
import { KANA_GOJUON, PITCH_PAIRS } from '../data/pitchAndKana';
import type { KanaChar, PitchPatternType, UserProgress } from '../types/learning';
import { playFeedbackSound, speakJapanese } from '../utils/speech';

interface PitchAndKanaLabProps {
  progress: UserProgress;
  onGainXp: (xp: number) => void;
}

const PATTERN_LABELS: Record<PitchPatternType, { name: string; desc: string; color: string }> = {
  heiban: {
    name: 'Heiban (平板 · Bằng)',
    desc: 'Thấp ở âm đầu, lên cao và giữ cao (không rơi)',
    color: '#10b981',
  },
  atamadaka: {
    name: 'Atamadaka (頭高 · Cao đầu)',
    desc: 'Cao ngay âm đầu rồi rơi xuống thấp',
    color: '#f43f5e',
  },
  nakadaka: {
    name: 'Nakadaka (中高 · Cao giữa)',
    desc: 'Lên cao ở giữa rồi rơi xuống trước khi hết từ',
    color: '#6366f1',
  },
  odaka: {
    name: 'Odaka (尾高 · Cao cuối)',
    desc: 'Lên cao ở cuối từ, rơi xuống khi đi với trợ từ (が/は)',
    color: '#f59e0b',
  },
};

function computePitchLevels(moraCount: number, dropAfter: number): ('H' | 'L')[] {
  // Japanese Tokyo pitch accent rules:
  // mora 1 and mora 2 ALWAYS differ in pitch!
  const levels: ('H' | 'L')[] = [];
  for (let i = 1; i <= moraCount; i++) {
    if (dropAfter === 1) {
      levels.push(i === 1 ? 'H' : 'L');
    } else if (dropAfter === 0) {
      levels.push(i === 1 ? 'L' : 'H');
    } else {
      if (i === 1) levels.push('L');
      else if (i <= dropAfter) levels.push('H');
      else levels.push('L');
    }
  }
  return levels;
}

export const PitchAndKanaLab: React.FC<PitchAndKanaLabProps> = ({
  progress,
  onGainXp,
}) => {
  const [subTab, setSubTab] = useState<'pitch' | 'kana'>('pitch');
  const [kanaScript, setKanaScript] = useState<'hiragana' | 'katakana' | 'both'>('both');
  const [selectedKana, setSelectedKana] = useState<KanaChar>(KANA_GOJUON[0]);

  // Pitch Ear Quiz
  const [quizPairIdx, setQuizPairIdx] = useState(0);
  const [quizTargetIsA, setQuizTargetIsA] = useState(true);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizPair = PITCH_PAIRS[quizPairIdx];

  const handlePlayPitchQuiz = () => {
    const word = quizTargetIsA ? quizPair.wordA : quizPair.wordB;
    speakJapanese(word.exampleJp, { rate: 0.9 });
  };

  const handleAnswerPitchQuiz = (choseA: boolean) => {
    const correct = choseA === quizTargetIsA;
    if (correct) {
      playFeedbackSound('correct', progress.soundEnabled);
      setQuizFeedback('🎉 Chuẩn tai bản xứ! (+15 XP)');
      onGainXp(15);
    } else {
      playFeedbackSound('wrong', progress.soundEnabled);
      const rightWord = quizTargetIsA ? quizPair.wordA : quizPair.wordB;
      setQuizFeedback(`💡 Câu vừa đọc là: ${rightWord.kanji} (${rightWord.meaningVi})`);
    }
  };

  const handleNextPitchQuiz = () => {
    setQuizPairIdx((i) => (i + 1) % PITCH_PAIRS.length);
    setQuizTargetIsA(Math.random() > 0.5);
    setQuizFeedback(null);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            Pitch Accent & Kana Lab
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Phát âm chuẩn Tokyo & Làm chủ Bảng chữ cái
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tiếng Nhật không có dấu thanh như tiếng Việt mà dùng Cao – Thấp (Pitch Accent) theo từng phách (Mora).
          </p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setSubTab('pitch')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              subTab === 'pitch'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            🎵 Pitch Accent Lab
          </button>
          <button
            onClick={() => setSubTab('kana')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              subTab === 'kana'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            あ Hiragana / Katakana
          </button>
        </div>
      </div>

      {subTab === 'pitch' && (
        <div className="space-y-6">
          {/* 4 Pitch Patterns Legend */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.keys(PATTERN_LABELS) as PitchPatternType[]).map((key) => {
              const info = PATTERN_LABELS[key];
              return (
                <div
                  key={key}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {info.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {info.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Minimal Pairs Interactive Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {PITCH_PAIRS.map((pair) => (
              <div
                key={pair.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-jp text-lg font-extrabold text-slate-900 dark:text-white">
                    Cùng đọc là 「{pair.kana}」
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Cặp tối thiểu
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[pair.wordA, pair.wordB].map((word, wIdx) => {
                    const levels = computePitchLevels(pair.morae.length, word.dropAfter);
                    const color = PATTERN_LABELS[word.pattern].color;
                    return (
                      <div
                        key={wIdx}
                        onClick={() => speakJapanese(word.exampleJp)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') speakJapanese(word.exampleJp);
                        }}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 hover:border-indigo-400 transition cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-jp font-extrabold text-xl text-slate-900 dark:text-white">
                            {word.kanji}
                          </span>
                          <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>

                        {/* SVG Pitch Step Visualizer */}
                        <PitchGraph
                          morae={pair.morae}
                          levels={levels}
                          color={color}
                          hasParticleDrop={word.pattern === 'odaka'}
                        />

                        <div>
                          <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {word.meaningVi}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {word.romaji}
                          </div>
                          <div className="text-[11px] font-jp text-indigo-600 dark:text-indigo-300 mt-1">
                            {word.exampleJp}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pitch Ear-Training Mini Quiz */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-slate-900 border border-amber-200 dark:border-amber-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  Thử thách phân biệt cao độ: 「{quizPair.kana}」
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Nghe câu ví dụ và đoán xem đó là từ A hay từ B!
                </p>
              </div>
              <button
                onClick={handlePlayPitchQuiz}
                className="btn-3d inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Nghe câu mẫu
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswerPitchQuiz(true)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left cursor-pointer"
              >
                <span className="font-jp font-extrabold text-lg text-slate-900 dark:text-white">
                  A. {quizPair.wordA.kanji} ({quizPair.wordA.romaji})
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {quizPair.wordA.meaningVi}
                </div>
              </button>
              <button
                onClick={() => handleAnswerPitchQuiz(false)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left cursor-pointer"
              >
                <span className="font-jp font-extrabold text-lg text-slate-900 dark:text-white">
                  B. {quizPair.wordB.kanji} ({quizPair.wordB.romaji})
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {quizPair.wordB.meaningVi}
                </div>
              </button>
            </div>

            {quizFeedback && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {quizFeedback}
                </span>
                <button
                  onClick={handleNextPitchQuiz}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-extrabold cursor-pointer"
                >
                  Cặp tiếp theo →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'kana' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Kana Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                {[
                  { id: 'both', label: 'Song song' },
                  { id: 'hiragana', label: 'Hiragana' },
                  { id: 'katakana', label: 'Katakana' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setKanaScript(opt.id as 'hiragana' | 'katakana' | 'both')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      kanaScript === opt.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Bấm vào ô chữ bất kỳ để nghe phát âm!
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {KANA_GOJUON.map((char) => {
                const isSelected = selectedKana.romaji === char.romaji;
                return (
                  <button
                    key={char.romaji}
                    onClick={() => {
                      setSelectedKana(char);
                      speakJapanese(char.hiragana);
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-jp font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                      {kanaScript === 'hiragana' && char.hiragana}
                      {kanaScript === 'katakana' && char.katakana}
                      {kanaScript === 'both' && (
                        <>
                          {char.hiragana}
                          <span className="text-sm text-indigo-500 ml-1">{char.katakana}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      {char.romaji}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Mnemonic Inspector */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center">
              <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Thẻ ghi nhớ hình ảnh (Tofugu Style)
              </div>
              <div className="flex justify-center items-baseline gap-5 py-3">
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">Hiragana</div>
                  <div className="font-jp text-6xl font-extrabold text-slate-900 dark:text-white">
                    {selectedKana.hiragana}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">Katakana</div>
                  <div className="font-jp text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {selectedKana.katakana}
                  </div>
                </div>
              </div>
              <div className="inline-block px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-extrabold text-lg text-slate-800 dark:text-slate-200">
                /{selectedKana.romaji}/
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-sm text-amber-900 dark:text-amber-200">
                💡 <strong>Mẹo nhớ nhanh:</strong> {selectedKana.mnemonic}
              </div>
              <button
                onClick={() => speakJapanese(selectedKana.hiragana)}
                className="btn-3d w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                Phát âm /{selectedKana.romaji}/
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PitchGraphProps {
  morae: string[];
  levels: ('H' | 'L')[];
  color: string;
  hasParticleDrop?: boolean;
}

const PitchGraph: React.FC<PitchGraphProps> = ({
  morae,
  levels,
  color,
  hasParticleDrop,
}) => {
  const displayMorae = hasParticleDrop ? [...morae, '(が)'] : morae;
  const displayLevels: ('H' | 'L')[] = hasParticleDrop ? [...levels, 'L'] : levels;
  const stepWidth = 34;
  const svgWidth = Math.max(84, displayMorae.length * stepWidth);

  const points = displayLevels.map((lvl, idx) => {
    const x = idx * stepWidth + stepWidth / 2;
    const y = lvl === 'H' ? 12 : 34;
    return { x, y, lvl, char: displayMorae[idx] };
  });

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="py-1">
      <svg width={svgWidth} height={64} className="overflow-visible">
        <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        {points.map((p, idx) => {
          const isParticle = hasParticleDrop && idx === points.length - 1;
          return (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill={isParticle ? '#ffffff' : color}
                stroke={color}
                strokeWidth={2}
              />
              <text
                x={p.x}
                y={56}
                textAnchor="middle"
                className="font-jp text-[13px] font-bold fill-slate-700 dark:fill-slate-200"
              >
                {p.char}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
