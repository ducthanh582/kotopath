import React from 'react';
import {
  AudioLines,
  BookOpenCheck,
  Compass,
  Layers,
  MessageSquareHeart,
  Sparkles,
} from 'lucide-react';
import type { NavTab } from '../types/learning';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  dueSrsCount: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

const NAV_ITEMS: {
  id: NavTab;
  label: string;
  shortLabel: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}[] = [
  {
    id: 'path',
    label: 'Lộ trình học',
    shortLabel: 'Lộ trình',
    sublabel: 'N5 → N1 Path',
    icon: Compass,
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'shadowing',
    label: 'Shadowing Studio',
    shortLabel: 'Shadow',
    sublabel: 'Luyện nói đuổi',
    icon: AudioLines,
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'roleplay',
    label: 'AI Roleplay',
    shortLabel: 'Roleplay',
    sublabel: 'Nhập vai thực tế',
    icon: MessageSquareHeart,
    badgeColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'pitch-kana',
    label: 'Pitch & Kana',
    shortLabel: 'Pitch',
    sublabel: 'Trọng âm & Bảng chữ',
    icon: Sparkles,
    badgeColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'srs',
    label: 'Ôn tập SRS',
    shortLabel: 'SRS',
    sublabel: 'Ghi nhớ chủ động',
    icon: Layers,
    badgeColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'roadmap',
    label: 'Thành thạo',
    shortLabel: 'Mục tiêu',
    sublabel: 'Can-Do & Daily Loop',
    icon: BookOpenCheck,
    badgeColor: 'text-violet-600 dark:text-violet-400',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  dueSrsCount,
  completedLessonsCount,
  totalLessonsCount,
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/90 backdrop-blur-md px-4 py-6 justify-between sticky top-0 h-screen">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-3 mb-7">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-jp font-extrabold text-xl">
              言
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  KotoPath
                </span>
                <span className="text-[11px] font-jp font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                  言パス
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Giao tiếp tiếng Nhật thực chiến
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 border-2 border-indigo-500/40 dark:border-indigo-400/40 shadow-sm'
                      : 'border-2 border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/80'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.badgeColor}`} />
                    </div>
                    <div>
                      <div
                        className={`text-sm font-bold ${
                          isActive
                            ? 'text-indigo-950 dark:text-white'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.sublabel}
                      </div>
                    </div>
                  </div>
                  {item.id === 'srs' && dueSrsCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                      {dueSrsCount}
                    </span>
                  )}
                  {item.id === 'path' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {completedLessonsCount}/{totalLessonsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fluency Loop Mini Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-indigo-950 dark:to-slate-950 text-white shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Công thức thành thạo
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 font-semibold whitespace-nowrap shrink-0">
              Daily Loop
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed mb-3">
            30% Ngữ pháp · 30% Nghe · 20% Shadowing · 20% Roleplay phản xạ.
          </p>
          <button
            onClick={() => onSelectTab('roadmap')}
            className="w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition cursor-pointer"
          >
            Xem bản đồ N5 → N1
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold leading-none">
                {item.shortLabel}
              </span>
              {item.id === 'srs' && dueSrsCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 min-w-4 h-4 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                  {dueSrsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
