"use client";

import React, { useState } from "react";
import { ReflectionEntry, ClassSession } from "@/store/useJournalStore";
import { Printer, ArrowLeft, FileText, CheckSquare, Square } from "lucide-react";

interface A5PrintLayoutProps {
  entries: ReflectionEntry[];
  currentClass: ClassSession;
  onBack: () => void;
}

export const A5PrintLayout: React.FC<A5PrintLayoutProps> = ({
  entries,
  currentClass,
  onBack,
}) => {
  // 인쇄 모드: "filled" (학생 답변 포함) vs "blank" (수기 작성용 줄노트 빈칸)
  const [printMode, setPrintMode] = useState<"filled" | "blank">("filled");
  // 선택된 항목만 인쇄
  const [selectedIds, setSelectedIds] = useState<string[]>(entries.map((e) => e.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map((e) => e.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const printableEntries = entries.filter((e) => selectedIds.includes(e.id));

  // A4 가로 한 장에 A5 2매가 들어가므로, 2개씩 묶는 페어(Pair) 배열 생성
  const entryPairs: (ReflectionEntry[])[] = [];
  for (let i = 0; i < printableEntries.length; i += 2) {
    entryPairs.push(printableEntries.slice(i, i + 2));
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      {/* 화면 제어 툴바 (화면에만 보이고 인쇄 시 no-print로 자동 숨김) */}
      <div className="no-print max-w-5xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span>A4 가로 2쪽(A5×2) 인쇄 미리보기</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                A4 가로 용지 1장에 2쪽씩 나란히 배치되어 포트폴리오 바인더 철 및 오프라인 배부에 최적화되어 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 인쇄 모드 전환 토글 */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPrintMode("filled")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  printMode === "filled"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                답변 인쇄 (포트폴리오용)
              </button>
              <button
                onClick={() => setPrintMode("blank")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  printMode === "blank"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                줄노트 빈칸 (수기 작성용)
              </button>
            </div>

            {/* 인쇄 실행 버튼 */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>지금 인쇄하기</span>
            </button>
          </div>
        </div>

        {/* 인쇄 대상 선택 바 */}
        <div className="mt-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-blue-600"
            >
              {selectedIds.length === entries.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>전체 선택 ({printableEntries.length}/{entries.length}명)</span>
            </button>
          </div>
          <span className="text-slate-400">
            총 {entryPairs.length}장의 A4 용지가 출력됩니다.
          </span>
        </div>
      </div>

      {/* 인쇄용 시트 컨테이너 (각 시트가 A4 가로 1장이며 내부 2개 A5 카드로 분할) */}
      <div className="max-w-[297mm] mx-auto space-y-8 print:space-y-0 px-4 print:px-0">
        {entryPairs.map((pair, sheetIdx) => (
          <div
            key={sheetIdx}
            className="print-sheet bg-white rounded-2xl print:rounded-none border print:border-none border-slate-300 p-6 print:p-0 shadow-md print:shadow-none min-h-[190mm] grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-[10mm]"
          >
            {pair.map((entry) => (
              <div
                key={entry.id}
                className="print-a5-card border-1.5 border-slate-400 rounded-xl p-4 flex flex-col justify-between bg-white text-slate-900 box-border text-[11px] leading-tight"
                style={{ minHeight: "185mm" }}
              >
                <div>
                  {/* A5 헤더: 타이틀 및 인적사항 표 */}
                  <div className="border-b-2 border-slate-800 pb-2 mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
                        수학 수업 성찰 일기
                      </h3>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {entry.date} ({entry.className})
                      </span>
                    </div>

                    {/* 인적사항 및 단원 메타정보 그리드 */}
                    <div className="grid grid-cols-4 gap-1 mt-2 text-[10px] bg-slate-50 border border-slate-300 p-1.5 rounded">
                      <div>
                        <span className="font-bold text-slate-700">과목:</span>{" "}
                        <span>{entry.subject}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">교사:</span>{" "}
                        <span>{entry.teacherName}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">학번:</span>{" "}
                        <span className="font-semibold">{entry.studentNumber}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">이름:</span>{" "}
                        <span className="font-semibold">{entry.studentName}</span>
                      </div>
                    </div>

                    <div className="mt-1.5 text-[10px] text-slate-800">
                      <strong className="font-bold">단원:</strong> {entry.chapter.major} &gt; {entry.chapter.minor} ({entry.chapter.topic})
                    </div>
                  </div>

                  {/* 4대 핵심 발문 및 답변/줄노트 영역 */}
                  <div className="space-y-2.5">
                    {/* 발문 1 */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">
                          1
                        </span>
                        <span>오늘 수업에서 다룬 핵심 개념이나 공식은 무엇인가요?</span>
                      </div>
                      {printMode === "filled" && entry.answers.concept ? (
                        <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed">
                          {entry.answers.concept}
                        </p>
                      ) : (
                        <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]">
                          {/* 빈칸 줄노트 */}
                        </div>
                      )}
                    </div>

                    {/* 발문 2 */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">
                          2
                        </span>
                        <span>내가 친구에게 쉽게 설명해 준다면 어떻게 말할 수 있을까요?</span>
                      </div>
                      {printMode === "filled" && entry.answers.explained ? (
                        <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed">
                          {entry.answers.explained}
                        </p>
                      ) : (
                        <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]">
                          {/* 빈칸 줄노트 */}
                        </div>
                      )}
                    </div>

                    {/* 발문 3 */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">
                          3
                        </span>
                        <span>오늘 새롭게 깨달았거나, 헷갈렸다가 풀린 부분은 무엇인가요?</span>
                      </div>
                      {printMode === "filled" && entry.answers.discovered ? (
                        <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed">
                          {entry.answers.discovered}
                        </p>
                      ) : (
                        <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]">
                          {/* 빈칸 줄노트 */}
                        </div>
                      )}
                    </div>

                    {/* 발문 4 */}
                    <div className="border border-slate-300 rounded p-2 bg-white">
                      <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold">
                          4
                        </span>
                        <span>더 확실히 내 것으로 만들기 위해 오늘 방과 후에 무엇을 해볼까요?</span>
                      </div>
                      {printMode === "filled" && entry.answers.plan ? (
                        <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed">
                          {entry.answers.plan}
                        </p>
                      ) : (
                        <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]">
                          {/* 빈칸 줄노트 */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 하단 확인 및 피드백 서명란 */}
                <div className="pt-2 border-t border-slate-300 mt-2 flex items-center justify-between text-[10px] text-slate-600">
                  <span>작성 확인: 학생 ( 서명 )</span>
                  <span>교사 피드백 및 확인 ( 서명/인 )</span>
                </div>
              </div>
            ))}

            {/* 홀수 개일 때 오른쪽 빈 페이지 플레이스홀더 */}
            {pair.length === 1 && (
              <div className="print-a5-card border-dashed border-2 border-slate-200 rounded-xl p-4 flex items-center justify-center text-slate-400 text-xs">
                (빈 페이지 - A5 규격 여백)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
