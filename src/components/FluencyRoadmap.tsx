import React from 'react';
import { Award, CheckSquare, Flame, RotateCcw, Square, Target } from 'lucide-react';
import { CANDO_MILESTONES } from '../data/srsDeck';
import { CURRICULUM_PHASES } from '../data/curriculum';
import type { UserProgress } from '../types/learning';

interface FluencyRoadmapProps {
  progress: UserProgress;
  onToggleCanDo: (id: string) => void;
  onChangeDailyGoal: (minutes: number) => void;
  onResetProgress: () => void;
}

export const FluencyRoadmap: React.FC<FluencyRoadmapProps> = ({
  progress,
  onToggleCanDo,
  onChangeDailyGoal,
  onResetProgress,
}) => {
  const totalLessons = CURRICULUM_PHASES.reduce((acc, p) => acc + p.lessons.length, 0);
  const checkedCount = progress.canDoChecked.length;
  const fluencyPct = Math.round((checkedCount / CANDO_MILESTONES.length) * 100);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
          <Target className="w-4 h-4" />
          Bản đồ Thành thạo Tiếng Nhật · N5 → N1
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Hệ thống Can-Do & Chu trình luyện tập mỗi ngày
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          JLPT chỉ kiểm tra Đọc & Nghe. Để <strong>nói trôi chảy</strong>, bạn cần duy trì chu trình 4 trụ cột hàng ngày.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Tiến độ Can-Do</div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {fluencyPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {checkedCount}/{CANDO_MILESTONES.length} cột mốc giao tiếp
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Bài học hoàn thành</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {progress.completedLessons.length}/{totalLessons}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Lộ trình N5 → N1</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Roleplay thực chiến</div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {progress.completedRoleplays.length}/4
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kịch bản đã chinh phục</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Chuỗi kỷ luật</div>
          <div className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center gap-1.5">
            <Flame className="w-5 h-5 fill-amber-500" />
            {progress.streak} ngày
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{progress.xp} XP tích lũy</div>
        </div>
      </div>

      {/* Daily Loop Blueprint */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Chu trình vàng mỗi ngày (Daily Fluency Loop)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn quỹ thời gian mỗi ngày để phân bổ chính xác 4 kỹ năng:
            </p>
          </div>
          <div className="flex gap-1.5">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => onChangeDailyGoal(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                  progress.dailyGoalMinutes === mins
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {mins} phút/ngày
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              pct: '30%',
              mins: Math.round(progress.dailyGoalMinutes * 0.3),
              title: 'Input Ngữ pháp & Mẫu câu',
              desc: 'Học bài mới trong Lộ trình & ôn thẻ SRS.',
              color: 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-500/10 dark:border-emerald-500/30',
            },
            {
              pct: '30%',
              mins: Math.round(progress.dailyGoalMinutes * 0.3),
              title: 'Nghe chủ động',
              desc: 'Nghe hội thoại tốc độ tự nhiên không nhìn phụ đề trước.',
              color: 'border-sky-300 bg-sky-50/70 dark:bg-sky-500/10 dark:border-sky-500/30',
            },
            {
              pct: '20%',
              mins: Math.round(progress.dailyGoalMinutes * 0.2),
              title: 'Shadowing Studio',
              desc: 'Nói đuổi theo âm bản xứ, tập pitch accent & rút gọn.',
              color: 'border-indigo-300 bg-indigo-50/70 dark:bg-indigo-500/10 dark:border-indigo-500/30',
            },
            {
              pct: '20%',
              mins: Math.round(progress.dailyGoalMinutes * 0.2),
              title: 'Output Roleplay AI',
              desc: 'Nhập vai phản xạ tình huống thật & tự đặt câu.',
              color: 'border-rose-300 bg-rose-50/70 dark:bg-rose-500/10 dark:border-rose-500/30',
            },
          ].map((block) => (
            <div key={block.title} className={`p-4 rounded-2xl border ${block.color}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {block.pct}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  ~{block.mins} phút
                </span>
              </div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                {block.title}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {block.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Can-Do Checklist (JF Standard / Busuu Inspired) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Bảng kiểm năng lực giao tiếp (JF Can-Do Statements)
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Tích vào kỹ năng bạn đã làm được
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {CANDO_MILESTONES.map((item) => {
            const checked = progress.canDoChecked.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggleCanDo(item.id)}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
                  checked
                    ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                {checked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.level}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.textVi}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Progress */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (window.confirm('Bạn muốn đặt lại toàn bộ tiến độ học tập về ban đầu?')) {
              onResetProgress();
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt lại dữ liệu học tập
        </button>
      </div>
    </div>
  );
};
