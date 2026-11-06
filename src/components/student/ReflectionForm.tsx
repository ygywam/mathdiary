"use client";

import React, { useState, useEffect } from "react";
import { ClassSession, ReflectionAnswers } from "@/store/useJournalStore";
import { Send, CheckCircle2, Sparkles, BookOpen } from "lucide-react";

interface ReflectionFormProps {
  currentClass: ClassSession;
  studentNumber: string;
  studentName: string;
  initialAnswers?: ReflectionAnswers;
  onSubmit: (answers: ReflectionAnswers) => void;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  currentClass,
  studentNumber,
  studentName,
  initialAnswers,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState<ReflectionAnswers>(
    initialAnswers || {
      concept: "",
      explained: "",
      discovered: "",
      plan: "",
    }
  );
  const [isSaved, setIsSaved] = useState(false);

  // 로컬 자동 임시저장
  useEffect(() => {
    const draftKey = `draft_${currentClass.id}_${studentNumber}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft && !initialAnswers) {
      try {
        setAnswers(JSON.parse(savedDraft));
      } catch {
        // 무시
      }
    }
  }, [currentClass.id, studentNumber, initialAnswers]);

  const handleChange = (field: keyof ReflectionAnswers, value: string) => {
    const next = { ...answers, [field]: value };
    setAnswers(next);
    localStorage.setItem(`draft_${currentClass.id}_${studentNumber}`, JSON.stringify(next));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answers.concept.trim() && !answers.explained.trim()) {
      alert("배운 개념이나 내용을 한 줄 이상 적어주세요.");
      return;
    }
    onSubmit(answers);
    localStorage.removeItem(`draft_${currentClass.id}_${studentNumber}`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 상단 단원 및 수업 안내 배너 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 p-5 border-b border-blue-100/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 bg-white px-2.5 py-1 rounded-md border border-blue-200/60 shadow-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{currentClass.name} · {currentClass.subject}</span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {new Date().toISOString().split("T")[0]}
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {currentClass.activeChapter.major}
          </h2>
          <p className="text-sm font-semibold text-blue-600 mt-0.5">
            {currentClass.activeChapter.minor}
            {currentClass.activeChapter.topic && ` · ${currentClass.activeChapter.topic}`}
          </p>
        </div>
      </div>

      {/* 일기 작성 폼 */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 질문 1: 배운 개념 */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>오늘 수업에서 다룬 핵심 개념이나 공식은 무엇인가요?</span>
          </label>
          <textarea
            rows={3}
            value={answers.concept}
            onChange={(e) => handleChange("concept", e.target.value)}
            placeholder="예: 이차방정식의 판별식 D=b²-4ac의 의미와 실근·허근 조건"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 질문 2: 내가 이해한 내용 */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>내가 친구에게 쉽게 설명해 준다면 어떻게 말할 수 있을까요?</span>
          </label>
          <textarea
            rows={3}
            value={answers.explained}
            onChange={(e) => handleChange("explained", e.target.value)}
            placeholder="예: 근호 안의 숫자가 양수면 실근이 2개 생기고, 음수면 허수 단위 i가 생겨서 허근이 되는 원리야..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 질문 3: 새롭게 알게 된 점 */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>오늘 새롭게 깨달았거나, 헷갈렸다가 풀린 부분은 무엇인가요?</span>
          </label>
          <textarea
            rows={3}
            value={answers.discovered}
            onChange={(e) => handleChange("discovered", e.target.value)}
            placeholder="예: 계수가 실수일 때만 판별식을 써야 한다는 조건을 처음 알았다."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 질문 4: 앞으로의 계획 */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
              4
            </span>
            <span>더 확실히 내 것으로 만들기 위해 오늘 방과 후에 무엇을 해볼까요?</span>
          </label>
          <textarea
            rows={3}
            value={answers.plan}
            onChange={(e) => handleChange("plan", e.target.value)}
            placeholder="예: 교과서 예제 3번 다시 풀기, 모르는 4번 문제 질문하기"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 하단 제출 및 상태 */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>작성 내용은 본인과 담당 선생님만 볼 수 있습니다.</span>
          </div>

          <div className="flex items-center space-x-3">
            {isSaved && (
              <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>성찰 일기 저장 완료!</span>
              </span>
            )}
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>성찰 일기 제출하기</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
