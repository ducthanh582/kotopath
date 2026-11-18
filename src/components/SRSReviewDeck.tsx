import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Layers, RotateCw, Volume2 } from 'lucide-react';
import { SRS_CARDS } from '../data/srsDeck';
import type { JLPTLevel, UserProgress } from '../types/learning';
import { playFeedbackSound, speakJapanese } from '../utils/speech';
import { FuriganaText } from './FuriganaText';

interface SRSReviewDeckProps {
  progress: UserProgress;
  onRateCard: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
}

export const SRSReviewDeck: React.FC<SRSReviewDeckProps> = ({
  progress,
  onRateCard,
}) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | JLPTLevel>('ALL');
  const [practiceAll, setPracticeAll] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const filteredCards = SRS_CARDS.filter(
    (c) => filterLevel === 'ALL' || c.level === filterLevel
  );

  const dueCards = filteredCards.filter((c) => {
    const state = progress.srsStates[c.id];
    return !state || state.dueAt <= now;
  });

  const deck = practiceAll ? filteredCards : dueCards;
  const activeCard = deck[cardIndex % Math.max(1, deck.length)];

  const handleRate = useCallback(
    (rating: 'again' | 'hard' | 'good' | 'easy') => {
      if (!activeCard) return;
      playFeedbackSound(rating === 'again' ? 'wrong' : 'correct', progress.soundEnabled);
      onRateCard(activeCard.id, rating);
      setNow(Date.now());
      setFlipped(false);
      if (practiceAll) {
        setCardIndex((i) => (i + 1) % Math.max(1, deck.length));
      } else {
        setCardIndex(0);
      }
    },
    [activeCard, deck.length, onRateCard, practiceAll, progress.soundEnabled]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeCard) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCard, flipped, handleRate]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
            <Layers className="w-4 h-4" />
            Smart SRS Review · WaniKani & Bunpro Style
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Ôn tập ngắt quãng — Nhớ trọn đời mẫu câu giao tiếp
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Phím tắt Power-User: bấm{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">
              Space
            </kbd>{' '}
            để lật thẻ,{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">
              1–4
            </kbd>{' '}
            để đánh giá mức độ nhớ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            {(['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setFilterLevel(lvl);
                  setCardIndex(0);
                  setFlipped(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                  filterLevel === lvl
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {lvl === 'ALL' ? 'Tất cả' : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-rose-600 dark:text-rose-400">
            Cần ôn hôm nay: {dueCards.length} thẻ
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 dark:text-slate-300">
            Tổng bộ thẻ: {filteredCards.length}
          </span>
        </div>
        <button
          onClick={() => {
            setPracticeAll((v) => !v);
            setCardIndex(0);
            setFlipped(false);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
            practiceAll
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {practiceAll ? 'Đang ôn tất cả thẻ' : 'Chế độ ôn tự do (Tất cả)'}
        </button>
      </div>

      {/* Flashcard Stage */}
      {activeCard ? (
        <div className="max-w-2xl mx-auto space-y-5">
          <div
            onClick={() => {
              if (!flipped) {
                setFlipped(true);
                speakJapanese(activeCard.plain);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setFlipped((f) => !f);
            }}
            className="min-h-[300px] p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between cursor-pointer hover:border-sky-400 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">
                  {activeCard.level}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {activeCard.category}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(activeCard.plain);
                }}
                className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 hover:bg-sky-100 cursor-pointer"
                title="Nghe phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                <FuriganaText
                  tokens={activeCard.tokens}
                  showFurigana={progress.showFurigana}
                />
              </div>
              {progress.showRomaji && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {activeCard.romaji}
                </div>
              )}

              {!flipped ? (
                <div className="pt-6 text-xs font-bold text-slate-400 inline-flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" />
                  Chạm vào thẻ hoặc bấm Space để xem nghĩa & ngữ cảnh
                </div>
              ) : (
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
                  <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 text-center">
                    {activeCard.vi}
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-jp font-bold text-sm text-slate-900 dark:text-white">
                        {activeCard.contextExampleJp}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(activeCard.contextExampleJp);
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                      >
                        🔊 Nghe câu
                      </button>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      → {activeCard.contextExampleVi}
                    </div>
                  </div>
                  <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl">
                    💡 {activeCard.note}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-center text-slate-400">
              {progress.srsStates[activeCard.id]
                ? `Đã ôn ${progress.srsStates[activeCard.id].reps} lần · Khoảng lặp hiện tại: ${Math.max(1, Math.round(progress.srsStates[activeCard.id].intervalDays))} ngày`
                : 'Thẻ mới chưa ôn'}
            </div>
          </div>

          {flipped && (
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { id: 'again', label: '1. Quên', sub: '~15 phút', cls: 'bg-rose-600 hover:bg-rose-700' },
                { id: 'hard', label: '2. Khó', sub: '1 ngày', cls: 'bg-amber-500 hover:bg-amber-600' },
                { id: 'good', label: '3. Tốt', sub: '1–3 ngày', cls: 'bg-emerald-600 hover:bg-emerald-700' },
                { id: 'easy', label: '4. Dễ ợt', sub: '4+ ngày', cls: 'bg-sky-600 hover:bg-sky-700' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() =>
                    handleRate(btn.id as 'again' | 'hard' | 'good' | 'easy')
                  }
                  className={`btn-3d py-3 px-2 rounded-2xl text-white text-center shadow-sm cursor-pointer ${btn.cls}`}
                >
                  <div className="text-xs sm:text-sm font-extrabold">{btn.label}</div>
                  <div className="text-[10px] opacity-90">{btn.sub}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Bạn đã ôn hết thẻ đến hạn hôm nay!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Não bộ ghi nhớ tốt nhất khi nghỉ ngơi đúng nhịp. Nếu muốn luyện thêm, hãy bật "Chế độ ôn tự do" ở góc trên.
          </p>
          <button
            onClick={() => {
              setPracticeAll(true);
              setCardIndex(0);
              setFlipped(false);
            }}
            className="btn-3d px-5 py-2.5 rounded-2xl bg-sky-600 text-white font-extrabold text-sm cursor-pointer"
          >
            Ôn tập tự do tất cả thẻ
          </button>
        </div>
      )}
    </div>
  );
};
