"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, ArrowLeft, X, Check } from "lucide-react";

export type TourContext = "student-login" | "student-journal" | "teacher-dashboard";

interface TourStep {
  selector: string;
  title: string;
  targetName: string;
  description: string;
  tip: string;
}

// 1. 학생 로그인 화면 전용 투어 (수업코드 불필요 간편 로그인)
const STEPS_STUDENT_LOGIN: TourStep[] = [
  {
    selector: '[data-tour="tour-student-number"]',
    title: "1. 학번 입력",
    targetName: "학번 입력칸",
    description: "본인의 학번(예: 20315)을 입력합니다. 수업코드를 외울 필요 없이 학번으로 내 수업에 자동 연결됩니다.",
    tip: "💡 이메일이나 전화번호 없이 안전하게 식별됩니다.",
  },
  {
    selector: '[data-tour="tour-pin"]',
    title: "2. 비밀번호 PIN",
    targetName: "비밀번호 PIN (숫자 4자리)",
    description: "본인의 4자리 비밀번호를 입력합니다. (선생님이 설정해주신 초기 비밀번호 또는 본인이 변경한 비밀번호)",
    tip: "💡 다른 친구는 내 일기를 절대 열어볼 수 없습니다.",
  },
  {
    selector: '[data-tour="tour-login-btn"]',
    title: "3. 수업 입장하기",
    targetName: "입장하기 버튼",
    description: "버튼을 누르면 배정된 수업의 오늘 단원과 성찰 일기 작성 화면으로 즉시 입장합니다.",
    tip: "💡 여러 수업을 듣는 경우 수업 선택 화면이 나타납니다.",
  },
];

// 2. 학생 일기 작성 화면 전용 투어
const STEPS_STUDENT_JOURNAL: TourStep[] = [
  {
    selector: '[data-tour="tour-journal-banner"]',
    title: "1. 오늘 수업 진도 단원",
    targetName: "단원 안내 배너",
    description: "선생님이 지정하신 오늘 수학 수업의 대단원, 중단원, 핵심 소주제가 상단에 표시됩니다.",
    tip: "💡 오늘 수업에서 다룬 내용에 집중하여 작성해보세요.",
  },
  {
    selector: '[data-tour="tour-q1"]',
    title: "2. 핵심 개념 질문",
    targetName: "질문 1번",
    description: "오늘 수업에서 다룬 핵심 개념이나 공식을 간략하게 적습니다.",
    tip: "💡 길게 쓸 필요 없이 핵심 키워드 중심으로 적어도 좋습니다.",
  },
  {
    selector: '[data-tour="tour-journal-submit"]',
    title: "3. 성찰 일기 제출",
    targetName: "일기 제출 버튼",
    description: "4가지 질문에 답변을 적고 제출하면 클라우드에 안전하게 저장됩니다.",
    tip: "💡 제출 즉시 아래 '나의 수학 성장 일기장'에 누적 보관됩니다.",
  },
  {
    selector: '[data-tour="tour-my-entries"]',
    title: "4. 나의 성장 일기장",
    targetName: "일기장 보관함",
    description: "내가 작성한 지난 일기들을 날짜별로 모아보며 나의 수학적 성장을 한눈에 확인할 수 있습니다.",
    tip: "💡 오직 본인에게만 공개되는 비밀 일기장입니다.",
  },
];

// 3. 교사 대시보드 화면 전용 투어
const STEPS_TEACHER_DASHBOARD: TourStep[] = [
  {
    selector: '[data-tour="tour-new-class-btn"]',
    title: "1. 새 수업 개설",
    targetName: "새 수업 개설 버튼",
    description: "담당 학급과 과목을 고르면 2022 개정 수학 교육과정 단원이 자동완성되고 고유 수업코드가 즉시 발급됩니다.",
    tip: "💡 한 학기 동안 사용할 고정 코드를 1초 만에 발급받으세요.",
  },
  {
    selector: '[data-tour="tour-roster-btn"]',
    title: "2. 학생 명렬표 엑셀 등록",
    targetName: "명렬표 엑셀 등록 버튼",
    description: "기본 엑셀 서식을 받아 학생 명렬을 업로드하면 수파베이스 DB에 전교생 계정이 즉시 일괄 생성됩니다.",
    tip: "💡 학생이 따로 회원가입할 필요가 없습니다.",
  },
  {
    selector: '[data-tour="tour-code-card"]',
    title: "3. 학급 고정 수업코드",
    targetName: "수업코드 카드",
    description: "발급된 고유 수업코드를 복사하여 교실 프로젝터나 칠판에 학생들에게 공유하세요.",
    tip: "💡 클릭 한 번으로 수업코드가 클립보드에 복사됩니다.",
  },
  {
    selector: '[data-tour="tour-filter-bar"]',
    title: "4. 3단 다차원 조건 필터링",
    targetName: "필터링 바",
    description: "날짜별, 특정 학생 1인 누적별, 단원별로 일기를 필터링하여 생기부 과세특 관찰 기록으로 즉시 활용합니다.",
    tip: "💡 학생명을 검색하면 해당 학생의 전체 일기가 모아집니다.",
  },
  {
    selector: '[data-tour="tour-print-btn"]',
    title: "5. A4 가로 2쪽(A5×2) 인쇄",
    targetName: "인쇄 바로가기 버튼",
    description: "A4 가로 한 장에 A5 크기 2쪽이 완벽하게 분할 인쇄되어 포트폴리오 및 상담 자료로 바로 출력됩니다.",
    tip: "💡 웹 UI 요소는 숨겨지고 인쇄용 규격 문서만 출력됩니다.",
  },
  {
    selector: '[data-tour="tour-settings-btn"]',
    title: "6. 교사 설정 및 학생 PIN 초기화",
    targetName: "교사 환경설정 버튼",
    description: "담당 교사 이름 변경, 관리자 비밀번호 변경, 학생이 PIN을 분실했을 때 1234로 초기화할 수 있습니다.",
    tip: "💡 교사 설정에서 비밀번호를 꼭 변경해두세요.",
  },
];

interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  context: TourContext;
}

export const TourGuide: React.FC<TourGuideProps> = ({ isOpen, onClose, context }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [postItPos, setPostItPos] = useState<{ top: number; left: number; arrowPlacement: "top" | "bottom" }>({
    top: 100,
    left: 20,
    arrowPlacement: "top",
  });

  // 현재 화면 컨텍스트에 맞는 단계 목록 선택
  const steps =
    context === "teacher-dashboard"
      ? STEPS_TEACHER_DASHBOARD
      : context === "student-journal"
      ? STEPS_STUDENT_JOURNAL
      : STEPS_STUDENT_LOGIN;

  const step = steps[currentStepIndex] || steps[0];

  // 위치 측정
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (el && el.offsetParent !== null) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      const postItWidth = 320;
      const postItHeight = 220;
      const margin = 14;

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
      setCurrentStepIndex(0);
    }
  }, [isOpen, context]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const timer = setTimeout(updatePosition, 200);
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
  const isLast = currentStepIndex === steps.length - 1;

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
        {/* 화살표 */}
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

        {/* 노란색 포스트잇 메모지 */}
        <div
          style={{
            background: "linear-gradient(135deg, #FEF08A 0%, #FDE047 100%)",
            boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
            transform: "rotate(-1deg)",
          }}
          className="rounded-2xl border-2 border-amber-300 p-4 sm:p-5 text-slate-800 relative transition-transform"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-200/80 border border-amber-300/80 rounded-xs shadow-2xs rotate-[1deg]" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 text-amber-900 hover:text-black hover:bg-amber-300/60 rounded-md transition-colors"
            title="사용법 닫기 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md">
              {currentStepIndex + 1} / {steps.length}
            </span>
            <span className="text-[11px] font-bold text-amber-800 truncate">
              {step.targetName}
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {step.title}
          </h4>

          <p className="mt-2 text-xs text-slate-800 leading-relaxed font-medium bg-white/70 p-2.5 rounded-xl border border-amber-200/80 whitespace-pre-line">
            {step.description}
          </p>

          <p className="mt-2 text-[11px] text-amber-950 font-semibold leading-tight">
            {step.tip}
          </p>

          <div className="mt-3.5 pt-2 border-t border-amber-300/80 flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, idx) => (
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
