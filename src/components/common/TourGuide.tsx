"use client";

import React, { useState } from "react";
import { Lightbulb, ArrowRight, ArrowLeft, X, Sparkles, Check } from "lucide-react";

interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  tag: string;
  targetDesc: string;
  description: string;
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "1단계 · 교사 수업 개설 및 수업코드 발급",
    tag: "교사용",
    targetDesc: "상단 [교사 대시보드] > [새 수업 개설]",
    description:
      "선생님이 관리자 인증(기본 PIN: 1234) 후 학년과 과목을 고르면 학기 고정 수업코드가 자동 발급됩니다. 2022 개정 교육과정 단원도 1클릭으로 바로 지정할 수 있습니다.",
    tip: "💡 발급된 수업코드는 칠판이나 프로젝터에 띄워 학생들에게 1회만 공유하면 됩니다.",
  },
  {
    title: "2단계 · 엑셀 명렬표 수파베이스 클라우드 등록",
    tag: "교사용",
    targetDesc: "[교사 대시보드] > [명렬표 엑셀 등록/다운로드]",
    description:
      "제공되는 기본 엑셀(CSV) 양식을 내려받아 학번과 학생 이름을 입력한 뒤 업로드하세요. 로컬 저장이 아닌 수파베이스 클라우드 DB에 즉시 영구 저장되어 언제 어디서나 유지됩니다.",
    tip: "💡 학생 개별 가입 절차 없이, 엑셀 1회 업로드로 전교생 계정이 즉시 세팅됩니다.",
  },
  {
    title: "3단계 · 학생 간편 로그인 및 성찰 일기 작성",
    tag: "학생용",
    targetDesc: "[학생 일기장] > 4개 입력칸(수업코드, 학번, 이름, PIN)",
    description:
      "학생은 복잡한 이메일 가입 없이 수업코드와 본인 학번, 4자리 PIN 번호로 안전하게 시작합니다. 수업 직후 4가지 핵심 질문에 자신의 배움을 5분 동안 솔직하게 기록합니다.",
    tip: "💡 학생은 오직 본인이 작성한 일기만 열람할 수 있도록 개인정보가 철저히 보호됩니다.",
  },
  {
    title: "4단계 · 3단 필터링 분석 및 A4 2쪽(A5×2) 규격 인쇄",
    tag: "교사용",
    targetDesc: "[교사 대시보드] > 날짜·학생·단원 필터 및 인쇄",
    description:
      "선생님은 날짜별, 학생 1인 누적별, 단원별로 일기를 필터링하여 생기부 과세특 관찰 기록으로 활용할 수 있습니다. [A4 가로 2쪽 인쇄]를 누르면 A5 규격 2장이 완벽하게 출력됩니다.",
    tip: "💡 수업 활동지 포트폴리오를 만들거나 학생 상담 자료로 바로 활용하세요.",
  },
];

export const TourGuide: React.FC<TourGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity">
      {/* 노란색 포스트잇 카드 스타일 */}
      <div className="relative w-full max-w-lg bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-2xl p-6 sm:p-7 rotate-[-0.5deg] text-slate-800 transition-all">
        {/* 상단 핀/테이프 시각 효과 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-amber-200/80 border border-amber-300/80 rounded-sm shadow-xs backdrop-blur-xs rotate-[1deg]" />

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 rounded-lg transition-colors"
          title="사용법 닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
            <Lightbulb className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
              {step.tag}
            </span>
            <span className="text-xs font-semibold text-amber-700 ml-2">
              가이드 {currentStep + 1} / {TOUR_STEPS.length}
            </span>
          </div>
        </div>

        {/* 타이틀 및 대상 설명 */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {step.title}
        </h3>
        <p className="text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg px-2.5 py-1 mt-2 inline-block">
          주목할 위치: {step.targetDesc}
        </p>

        {/* 본문 설명 */}
        <div className="mt-3.5 bg-white/80 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p>{step.description}</p>
          <div className="pt-2 border-t border-amber-200/60 text-[11px] font-medium text-amber-900">
            {step.tip}
          </div>
        </div>

        {/* 하단 단계 이동 버튼 바 */}
        <div className="mt-6 flex items-center justify-between pt-2">
          <div className="flex space-x-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? "w-5 bg-amber-600" : "bg-amber-300"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>이전</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
            >
              <span>{isLast ? "시작하기" : "다음"}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
