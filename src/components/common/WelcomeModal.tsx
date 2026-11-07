"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY_WELCOME = "math_reflection_welcome_dismissed_v1";

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_WELCOME, "true");
    }
    onClose();
  };

  const handleNeverShowAgainDirect = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_WELCOME, "true");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* 상단 일러스트 카드 이미지 */}
        <div className="relative w-full aspect-[16/9] bg-blue-50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/welcome-card.svg"
            alt="수학 수업 성찰 일기 환영 안내"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 설명 */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span>수학 수업 성찰 일기에 오신 것을 환영합니다!</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              선생님은 학급 고유 수업코드를 개설하고 학생 명렬을 등록하며, 학생은 4가지 핵심 질문에 오늘 배운 수학을 솔직하게 기록하여 나만의 배움 포트폴리오를 만들어갑니다.
            </p>
          </div>

          {/* 하단 다시 보지 않기 옵션 및 확인 버튼 */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span>이 기기에서 다시 보지 않기</span>
            </label>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleNeverShowAgainDirect}
                className="flex-1 sm:flex-none px-3 py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                다시 안 보기
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1"
              >
                <span>시작하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
