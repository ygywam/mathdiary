"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ArrowLeft, X, Sparkles, Lightbulb, Check } from "lucide-react";

interface TourStep {
  selector: string;
  title: string;
  targetName: string;
  description: string;
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="tour-role-nav"]',
    title: "1. 학생 / 교사 모드 전환",
    targetName: "상단 모드 탭",
    description:
      "학생은 [학생 일기장]에서 성찰 일기를 작성하고, 선생님은 [교사 대시보드]에서 관리자 PIN(1234)을 입력하여 대시보드로 입장합니다.",
    tip: "💡 학생과 교사의 권한이 분리되어 타인의 일기는 볼 수 없습니다.",
  },
  {
    selector: '[data-tour="tour-class-code"]',
    title: "2. 수업코드 입력",
    targetName: "수업코드 입력칸",
    description:
      "선생님이 칠판이나 프로젝터에 알려주신 학급 고유 수업코드(예: MTH-101)를 입력합니다.",
    tip: "💡 매 수업마다 바꿀 필요 없이, 한 학기 동안 동일한 고정 코드를 사용합니다.",
  },
  {
    selector: '[data-tour="tour-student-number"]',
    title: "3. 학번 입력",
    targetName: "학번 입력칸",
    description:
      "학생 본인의 학번(예: 10101)을 입력합니다. 이메일이나 휴대폰 번호 없이 안전하게 식별됩니다.",
    tip: "💡 개인정보를 수집하지 않으므로 학교 현장에서 안심하고 쓸 수 있습니다.",
  },
  {
    selector: '[data-tour="tour-student-name"]',
    title: "4. 이름 입력",
    targetName: "이름 입력칸",
    description:
      "일기장에 표시될 학생의 이름 또는 닉네임을 입력합니다.",
    tip: "💡 선생님의 대시보드 및 생기부 관찰 기록용 이름으로 매칭됩니다.",
  },
  {
    selector: '[data-tour="tour-student-pin"]',
    title: "5. 나만의 비밀번호 PIN",
    targetName: "비밀번호 PIN (숫자 4자리)",
    description:
      "나만 아는 4자리 숫자를 입력합니다. 다음번 로그인 때도 이 PIN으로 본인 일기장만 열람할 수 있습니다.",
    tip: "💡 다른 친구는 내 일기를 절대 열어볼 수 없도록 비밀번호로 보호됩니다.",
  },
  {
    selector: '[data-tour="tour-login-btn"]',
    title: "6. 수업 입장 & 성찰 일기 쓰기",
    targetName: "입장하기 버튼",
    description:
      "정보 입력 후 버튼을 누르면 오늘 수업의 단원이 표시되고 4가지 핵심 질문에 5분 성찰 일기를 작성할 수 있습니다.",
    tip: "💡 교사 대시보드에서는 [새 수업 개설] 및 [명렬표 엑셀 등록]을 진행할 수 있습니다.",
  },
  {
    selector: '[data-tour="tour-new-class-btn"]',
    title: "7. [교사용] 새 수업 개설",
    targetName: "새 수업 개설 버튼",
    description:
      "선생님이 관리자 인증(1234) 후 학년과 과목을 고르면 2022 개정 수학 교육과정 단원이 1클릭으로 자동 세팅되고 고유 수업코드가 발급됩니다.",
    tip: "💡 발급된 수업코드는 프로젝터에 띄워 학생들에게 공유하세요.",
  },
  {
    selector: '[data-tour="tour-roster-btn"]',
    title: "8. [교사용] 학생 명렬표 엑셀 클라우드 등록",
    targetName: "명렬표 엑셀 등록/다운로드 버튼",
    description:
      "기본 엑셀 서식을 받아 학번과 이름을 입력하고 업로드하면, 수파베이스 클라우드에 전교생 계정이 즉시 영구 저장됩니다.",
    tip: "💡 학생들이 개별 가입할 필요 없이 수업코드와 학번으로 바로 시작합니다.",
  },
];

interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [postItPos, setPostItPos] = useState<{ top: number; left: number; arrowPlacement: "top" | "bottom" }>({
    top: 100,
    left: 20,
    arrowPlacement: "top",
  });

  const step = TOUR_STEPS[currentStepIndex];

  // 타겟 요소 위치 측정 및 스포트라이트 좌표 계산
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      const postItWidth = 320;
      const postItHeight = 220;
      const margin = 14;

      // 화면 아래쪽 공간 확인
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeBelow = spaceBelow >= postItHeight + margin || rect.top < postItHeight + margin;

      let top = placeBelow ? rect.bottom + margin : rect.top - postItHeight - margin;
      top = Math.max(16, Math.min(window.innerHeight - postItHeight - 16, top));

      let left = rect.left + rect.width / 2 - postItWidth / 2;
      left = Math.max(16, Math.min(window.innerWidth - postItWidth - 16, left));

      setPostItPos({
        top,
        left,
        arrowPlacement: placeBelow ? "top" : "bottom",
      });
    } else {
      // 화면에 해당 요소가 없을 경우 (예: 교사 화면인데 학생 뷰 타겟)
      setTargetRect(null);
      setPostItPos({
        top: window.innerHeight / 2 - 110,
        left: window.innerWidth / 2 - 160,
        arrowPlacement: "top",
      });
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const timer = setTimeout(updatePosition, 250);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, currentStepIndex, updatePosition, onClose]);

  if (!isOpen) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      setCurrentStepIndex(0);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // 화살표 가로 중심 위치
  const arrowLeft = targetRect
    ? Math.max(20, Math.min(290, targetRect.left + targetRect.width / 2 - postItPos.left))
    : 160;

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden pointer-events-auto">
      {/* 1. 사각형 스포트라이트 구멍 (해당 요소만 투명하고 주위 전체는 78% 어둡게 가림) */}
      {targetRect ? (
        <div
          style={{
            position: "fixed",
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: 14,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.78)",
            border: "3px solid #F59E0B",
            pointerEvents: "none",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 9991,
          }}
          className="ring-4 ring-amber-400/40 animate-pulse"
        />
      ) : (
        /* 타겟 요소가 화면에 없을 때 전체 배경 딤 */
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[9991]" />
      )}

      {/* 2. 노란색 포스트잇 설명 카드 + 화살표 */}
      <div
        style={{
          position: "fixed",
          top: postItPos.top,
          left: postItPos.left,
          width: 320,
          zIndex: 9995,
          transition: "top 0.25s ease-out, left 0.25s ease-out",
        }}
        className="relative"
      >
        {/* 화살표 (Pointer Arrow) */}
        {targetRect && (
          <div
            style={{
              position: "absolute",
              left: arrowLeft - 10,
              top: postItPos.arrowPlacement === "top" ? -12 : "auto",
              bottom: postItPos.arrowPlacement === "bottom" ? -12 : "auto",
              zIndex: 9996,
            }}
            className="w-0 h-0"
          >
            {postItPos.arrowPlacement === "top" ? (
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-amber-300 filter drop-shadow-xs" />
            ) : (
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-amber-300 filter drop-shadow-xs" />
            )}
          </div>
        )}

        {/* 실제 노란색 포스트잇 메모지 */}
        <div
          style={{
            background: "linear-gradient(135deg, #FEF08A 0%, #FDE047 100%)",
            boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
            transform: "rotate(-1deg)",
          }}
          className="rounded-2xl border-2 border-amber-300 p-4 sm:p-5 text-slate-800 relative transition-transform"
        >
          {/* 상단 반투명 마스킹 테이프 장식 */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-200/80 border border-amber-300/80 rounded-xs shadow-2xs rotate-[1deg]" />

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 text-amber-900 hover:text-black hover:bg-amber-300/60 rounded-md transition-colors"
            title="사용법 닫기 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 단계 인디케이터 배지 */}
          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md">
              {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
            <span className="text-[11px] font-bold text-amber-800 truncate">
              {step.targetName}
            </span>
          </div>

          {/* 제목 */}
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {step.title}
          </h4>

          {/* 본문 설명 */}
          <p className="mt-2 text-xs text-slate-800 leading-relaxed font-medium bg-white/70 p-2.5 rounded-xl border border-amber-200/80">
            {step.description}
          </p>

          {/* 팁 */}
          <p className="mt-2 text-[11px] text-amber-950 font-semibold leading-tight">
            {step.tip}
          </p>

          {/* 하단 이동 버튼군 */}
          <div className="mt-3.5 pt-2 border-t border-amber-300/80 flex items-center justify-between">
            <div className="flex space-x-1">
              {TOUR_STEPS.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex ? "w-3 bg-amber-800" : "bg-amber-300"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-1.5">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors border border-amber-400/60 flex items-center space-x-0.5"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>이전</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors shadow-xs flex items-center space-x-0.5"
              >
                <span>{isLast ? "완료" : "다음"}</span>
                {isLast ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
