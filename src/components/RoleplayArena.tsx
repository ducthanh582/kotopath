import React, { useState } from 'react';
import {
  CheckCircle2,
  Lightbulb,
  MessageSquareHeart,
  Mic,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { ROLEPLAY_SCENARIOS } from '../data/roleplay';
import type { RoleplayScenario, UserProgress } from '../types/learning';
import {
  playFeedbackSound,
  speakJapanese,
  startJapaneseRecognition,
} from '../utils/speech';
import { FuriganaText } from './FuriganaText';

interface RoleplayArenaProps {
  progress: UserProgress;
  onCompleteRoleplay: (scenarioId: string, xp: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'partner' | 'user' | 'feedback';
  textJp: string;
  romaji?: string;
  vi?: string;
  note?: string;
}

export const RoleplayArena: React.FC<RoleplayArenaProps> = ({
  progress,
  onCompleteRoleplay,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(
    ROLEPLAY_SCENARIOS[0]
  );
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const first = ROLEPLAY_SCENARIOS[0].steps[0];
    return [
      {
        id: 'init-0',
        sender: 'partner',
        textJp: first.partnerPlain,
        romaji: first.partnerRomaji,
        vi: first.partnerVi,
      },
    ];
  });
  const [inputVal, setInputVal] = useState('');
  const [showHints, setShowHints] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentStep = selectedScenario.steps[stepIdx];

  const startScenario = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
    setStepIdx(0);
    setFinished(false);
    setInputVal('');
    setShowHints(true);
    const first = scenario.steps[0];
    setMessages([
      {
        id: `init-${scenario.id}`,
        sender: 'partner',
        textJp: first.partnerPlain,
        romaji: first.partnerRomaji,
        vi: first.partnerVi,
      },
    ]);
    speakJapanese(first.partnerPlain);
  };

  const handleSendReply = (replyText: string, customVi?: string) => {
    const trimmed = replyText.trim();
    if (!trimmed || finished || !currentStep) return;

    const matched = currentStep.expectedKeywords.some((kw) =>
      trimmed.toLowerCase().includes(kw.toLowerCase())
    );

    const feedbackText = matched
      ? currentStep.feedbackNatural
      : `Câu trả lời hợp lệ! Mẹo để tự nhiên hơn: ${currentStep.grammarCheckTip}`;

    playFeedbackSound(matched ? 'correct' : 'complete', progress.soundEnabled);

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        textJp: trimmed,
        vi: customVi,
      },
      {
        id: `fb-${Date.now()}`,
        sender: 'feedback',
        textJp: feedbackText,
        note: currentStep.grammarCheckTip,
      },
    ];

    const nextIdx = stepIdx + 1;
    if (nextIdx < selectedScenario.steps.length) {
      const nextStep = selectedScenario.steps[nextIdx];
      newMessages.push({
        id: `partner-${Date.now()}`,
        sender: 'partner',
        textJp: nextStep.partnerPlain,
        romaji: nextStep.partnerRomaji,
        vi: nextStep.partnerVi,
      });
      setStepIdx(nextIdx);
      setTimeout(() => speakJapanese(nextStep.partnerPlain), 350);
    } else {
      setFinished(true);
      onCompleteRoleplay(selectedScenario.id, 65);
    }

    setMessages(newMessages);
    setInputVal('');
  };

  const handleVoiceReply = () => {
    setIsListening(true);
    startJapaneseRecognition({
      onResult: (transcript) => {
        setInputVal(transcript);
      },
      onError: () => {},
      onEnd: () => setIsListening(false),
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
          <MessageSquareHeart className="w-4 h-4" />
          AI Roleplay Arena · Phản xạ giao tiếp thực tế
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Nhập vai hội thoại Nhật Bản không áp lực
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Thực hành nói hoặc nhắn tiếng Nhật với các tình huống đời thực từ Conbini đến phòng phỏng vấn.
        </p>
      </div>

      {/* Scenario Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLEPLAY_SCENARIOS.map((sc) => {
          const isActive = sc.id === selectedScenario.id;
          const isCompleted = progress.completedRoleplays.includes(sc.id);
          return (
            <button
              key={sc.id}
              onClick={() => startScenario(sc)}
              className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer ${
                isActive
                  ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-500/15 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{sc.partnerAvatar}</span>
                <div className="flex items-center gap-1.5">
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {sc.level}
                  </span>
                </div>
              </div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                {sc.title}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {sc.formality}
              </div>
            </button>
          );
        })}
      </div>

      {/* Arena Split Layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Chat Column */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          {/* Persistent Context Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                {selectedScenario.partnerAvatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm">
                    {selectedScenario.partnerName}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15">
                    {selectedScenario.partnerRole}
                  </span>
                </div>
                <p className="text-xs text-indigo-100 mt-0.5">
                  🎯 {selectedScenario.missionVi}
                </p>
              </div>
            </div>
            <button
              onClick={() => startScenario(selectedScenario)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Bắt đầu lại kịch bản"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="p-4 sm:p-5 space-y-4 flex-1 min-h-[340px] max-h-[460px] overflow-y-auto bg-slate-50/60 dark:bg-slate-950/40">
            {messages.map((msg) => {
              if (msg.sender === 'feedback') {
                return (
                  <div
                    key={msg.id}
                    className="mx-auto max-w-lg p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1"
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Nhận xét giao tiếp:
                    </div>
                    <p>{msg.textJp}</p>
                    {msg.note && <p className="opacity-85">📌 {msg.note}</p>}
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-jp font-bold text-base leading-relaxed">
                        {msg.textJp}
                      </span>
                      <button
                        onClick={() => speakJapanese(msg.textJp)}
                        className={`p-1.5 rounded-lg shrink-0 cursor-pointer ${
                          isUser
                            ? 'bg-white/15 hover:bg-white/25 text-white'
                            : 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                        }`}
                        title="Nghe câu này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {progress.showRomaji && msg.romaji && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {msg.romaji}
                      </div>
                    )}
                    {msg.vi && (
                      <div
                        className={`text-xs mt-1 ${
                          isUser
                            ? 'text-indigo-100'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {msg.vi}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {finished && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-400 text-center space-y-2">
                <div className="font-extrabold text-emerald-800 dark:text-emerald-200">
                  🎉 Hoàn thành tình huống! (+65 XP)
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Bạn đã xử lý trôi chảy tình huống {selectedScenario.setting}. Thử kịch bản khác hoặc nói lại tự nhiên hơn nhé!
                </p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <button
              onClick={handleVoiceReply}
              disabled={finished || isListening}
              className={`p-3 rounded-2xl transition cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 hover:bg-rose-100'
              }`}
              title="Trả lời bằng giọng nói tiếng Nhật"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputVal}
              disabled={finished}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendReply(inputVal);
              }}
              placeholder={
                finished
                  ? 'Đã hoàn thành kịch bản!'
                  : 'Nhập câu trả lời tiếng Nhật hoặc chọn gợi ý bên phải...'
              }
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-jp"
            />
            <button
              onClick={() => handleSendReply(inputVal)}
              disabled={finished || !inputVal.trim()}
              className="btn-3d p-3 rounded-2xl bg-indigo-600 disabled:opacity-40 text-white hover:bg-indigo-700 cursor-pointer shrink-0"
              title="Gửi câu trả lời"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Smart Hint Drawer (Omotenashi UI) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Gợi ý phản hồi (3 sắc thái)
                </h3>
              </div>
              <button
                onClick={() => setShowHints((s) => !s)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
              >
                {showHints ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
              </button>
            </div>

            {showHints && currentStep && !finished ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chọn 1 cách nói phù hợp với mức độ lịch sự của bối cảnh, hoặc bấm loa để nghe trước:
                </p>
                {currentStep.hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 space-y-2 hover:border-indigo-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300">
                        {hint.tone}
                      </span>
                      <button
                        onClick={() => speakJapanese(hint.plain)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs cursor-pointer"
                        title="Nghe thử"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      <FuriganaText
                        tokens={hint.tokens}
                        showFurigana={progress.showFurigana}
                      />
                    </div>
                    {progress.showRomaji && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {hint.romaji}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        “{hint.vi}”
                      </span>
                      <button
                        onClick={() => handleSendReply(hint.plain, hint.vi)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
                      >
                        Nói câu này →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                {finished
                  ? 'Bạn đã hoàn tất lượt hội thoại này! Chọn tình huống mới ở trên.'
                  : 'Đang ẩn gợi ý để bạn tự thử sức phản xạ.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
