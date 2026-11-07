"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Sparkles, Compass, CheckCircle2, Check } from "lucide-react";

interface FullscreenIntroProps {
  onStart: () => void;
}

const STORAGE_KEY_INTRO = "math_reflection_intro_dismissed_v1";

export const FullscreenIntro: React.FC<FullscreenIntroProps> = ({ onStart }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleStart = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_INTRO, "true");
    }
    setIsClosing(true);
    setTimeout(() => {
      onStart();
    }, 350);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white transition-opacity duration-300 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 배경 전체를 채우는 인라인 고해상도 수학 테마 벡터 그래픽 (엑박 100% 방지) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        <svg
          className="w-full h-full"
          viewBox="0 0 1920 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* 좌표평면 및 미세 격자망 */}
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
            </pattern>
            <linearGradient id="curve-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="shape-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <rect width="1920" height="1080" fill="url(#grid-pattern)" />

          {/* 수학 함수 곡선 (사인 파동 및 가우스 곡선) */}
          <path
            d="M 0 540 Q 240 220 480 540 T 960 540 T 1440 540 T 1920 540"
            fill="none"
            stroke="url(#curve-grad-1)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />
          <path
            d="M 0 680 Q 360 400 720 680 T 1440 680 T 2160 680"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            opacity="0.4"
          />

          {/* 기하학적 정이십면체 및 정사면체 와이어프레임 */}
          <g transform="translate(180, 220)" stroke="#93C5FD" strokeWidth="1.5" opacity="0.6">
            <polygon points="0,0 120,-70 240,0 240,140 120,210 0,140" fill="url(#shape-grad-1)" />
            <line x1="0" y1="0" x2="240" y2="140" />
            <line x1="240" y1="0" x2="0" y2="140" />
            <line x1="120" y1="-70" x2="120" y2="210" />
          </g>

          {/* 우측 하단 뫼비우스 및 회전 피타고라스 삼각형 */}
          <g transform="translate(1450, 620)" stroke="#A78BFA" strokeWidth="2" opacity="0.5">
            <polygon points="0,150 200,150 0,0" fill="none" />
            <rect x="0" y="125" width="25" height="25" fill="none" />
            <circle cx="100" cy="75" r="125" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="8 8" fill="none" />
          </g>

          {/* 수학 기호 플로팅 (∑, ∫, π, √, ∞, lim) */}
          <text x="320" y="780" fill="#93C5FD" fontSize="72" fontFamily="serif" opacity="0.3">∫</text>
          <text x="500" y="880" fill="#93C5FD" fontSize="64" fontFamily="serif" opacity="0.3">f(x)dx</text>
          <text x="1320" y="260" fill="#A78BFA" fontSize="80" fontFamily="serif" opacity="0.35">∑</text>
          <text x="1600" y="380" fill="#38BDF8" fontSize="72" fontFamily="serif" opacity="0.3">π</text>
          <text x="820" y="160" fill="#F472B6" fontSize="56" fontFamily="sans-serif" opacity="0.25">∞</text>
          <text x="1100" y="920" fill="#6EE7B7" fontSize="52" fontFamily="serif" opacity="0.25">√x</text>
        </svg>
      </div>

      {/* 상단 미니 바 */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/80 border border-blue-400/30 flex items-center justify-center shadow-lg backdrop-blur-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">수학 수업 성찰 일기</span>
            <span className="text-xs text-blue-200/80 block">2022 개정 교육과정 및 고교학점제 맞춤형</span>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="text-xs text-blue-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm"
        >
          건너뛰고 바로 시작 →
        </button>
      </header>

      {/* 중앙 메인 히어로 섹션 */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-semibold mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>선생님과 학생이 함께 만드는 5분의 기적</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">
          오늘 배운 수학,<br />나만의 언어로 완성하다
        </h1>

        <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed mb-10 font-normal">
          단순히 문제를 푸는 것을 넘어, 수업 직후 스스로 개념을 복기하고 취약점을 진단합니다.<br className="hidden sm:inline" />
          매일 누적되는 4가지 핵심 질문의 기록이 학생에게는 확실한 성장을, 선생님께는 생생한 학생 맞춤 지도의 나침반이 됩니다.
        </p>

        {/* 3대 핵심 가치 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10 text-left">
          <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-xl bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-sm text-white mb-1">개념 내면화</h3>
            <p className="text-xs text-blue-100/70 leading-relaxed">
              수업에서 배운 핵심 원리를 교과서 문장이 아닌 나만의 단어와 수식으로 직접 정리합니다.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-sm text-white mb-1">자기주도 메타인지</h3>
            <p className="text-xs text-blue-100/70 leading-relaxed">
              이해되지 않았던 부분과 오개념을 솔직히 마주하고, 방과 후 보완 계획을 구체화합니다.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xl hover:bg-white/15 transition-all">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-sm text-white mb-1">고교학점제 포트폴리오</h3>
            <p className="text-xs text-blue-100/70 leading-relaxed">
              수업별·단원별로 차곡차곡 쌓인 성찰 일기가 모여 나만의 소중한 수학 학습 이력이 됩니다.
            </p>
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-base shadow-2xl shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2 cursor-pointer"
        >
          <span>수학 성찰 시작하기</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </main>

      {/* 하단 푸터 및 다시 보지 않기 옵션 */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 text-xs text-blue-200/70">
        <label className="flex items-center space-x-2.5 cursor-pointer select-none hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-white/30 bg-white/10 cursor-pointer"
          />
          <span>이 기기에서 다시 보지 않기 (다음부터 곧바로 로그인)</span>
        </label>

        <div>
          <span>© 2026 수학 수업 성찰 일기 · 학교 현장 맞춤형 플랫폼</span>
        </div>
      </footer>
    </div>
  );
};
