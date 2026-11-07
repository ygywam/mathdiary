"use client";

import React, { useState } from "react";
import { ReflectionEntry, ClassSession } from "@/store/useJournalStore";
import { Printer, ArrowLeft, CheckSquare, Square, FileText, Columns } from "lucide-react";

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
  // 인쇄 용지 레이아웃 규격: "a4-single" (A4 세로 1장 전면형) vs "a4-double" (A4 가로 2쪽 분할형)
  const [pageLayout, setPageLayout] = useState<"a4-single" | "a4-double">("a4-double");

  // 인쇄 내용 모드: "filled" (학생 작성 답변 포함) vs "blank" (수기 작성용 줄노트 빈칸)
  const [printMode, setPrintMode] = useState<"filled" | "blank">(
    entries.length === 0 ? "blank" : "filled"
  );

  // 선택된 학생 항목 ID 목록
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

  const todayStr = new Date().toISOString().split("T")[0];

  // 인쇄 대상 항목 구성
  let printItems: ReflectionEntry[] = [];

  if (printMode === "filled") {
    printItems = entries.filter((e) => selectedIds.includes(e.id));
  } else {
    // 줄노트 빈칸 (수기 작성용) 모드
    if (selectedIds.length > 0 && entries.length > 0) {
      // 선택된 학생들의 이름/학번이 적힌 빈칸 활동지
      printItems = entries
        .filter((e) => selectedIds.includes(e.id))
        .map((e) => ({
          ...e,
          answers: { concept: "", explained: "", discovered: "", plan: "" },
        }));
    } else {
      // 학생이 선택되지 않았거나 일기가 없을 때: 수기 작성용 순수 빈 활동지 1세트 생성 (절대 빈화면이 나오지 않음)
      const count = pageLayout === "a4-single" ? 1 : 2;
      printItems = Array.from({ length: count }, (_, idx) => ({
        id: `blank_template_${idx}`,
        classId: currentClass.id,
        studentId: "",
        studentNumber: "_______",
        studentName: "_______",
        className: currentClass.name,
        subject: currentClass.subject,
        teacherName: currentClass.teacherName || "수학교사",
        date: todayStr,
        chapter: currentClass.activeChapter,
        answers: { concept: "", explained: "", discovered: "", plan: "" },
        createdAt: todayStr,
      }));
    }
  }

  // 레이아웃별 시트 묶음 구성
  // a4-single: 1장당 1개 아이템
  // a4-double: 1장당 2개 아이템 (A5 2매 페어)
  const sheets: (ReflectionEntry[])[] = [];
  const itemsPerSheet = pageLayout === "a4-single" ? 1 : 2;
  for (let i = 0; i < printItems.length; i += itemsPerSheet) {
    sheets.push(printItems.slice(i, i + itemsPerSheet));
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      {/* 동적 인쇄 스타일 주입: A4 세로 vs A4 가로 브라우저 출력 규격 제어 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: ${pageLayout === "a4-single" ? "A4 portrait" : "A4 landscape"};
                margin: ${pageLayout === "a4-single" ? "12mm 15mm" : "8mm 10mm"};
              }
              body {
                background: #FFFFFF !important;
                color: #000000 !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
              .print-sheet {
                display: ${pageLayout === "a4-single" ? "block" : "grid"} !important;
                ${pageLayout === "a4-double" ? "grid-template-columns: 1fr 1fr !important; gap: 10mm !important;" : ""}
                width: 100% !important;
                min-height: ${pageLayout === "a4-single" ? "265mm" : "190mm"} !important;
                page-break-after: always !important;
                break-inside: avoid !important;
              }
              .print-card-single {
                border: 2px solid #334155 !important;
                border-radius: 8px !important;
                padding: 16px 20px !important;
                box-sizing: border-box !important;
                background: #FFFFFF !important;
                min-height: 260mm !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
              .print-card-double {
                border: 1.5px solid #64748B !important;
                border-radius: 8px !important;
                padding: 12px 14px !important;
                box-sizing: border-box !important;
                background: #FFFFFF !important;
                min-height: 185mm !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
            }
          `,
        }}
      />

      {/* 화면 제어 툴바 (화면 표시용, 인쇄 시 no-print로 자동 숨김) */}
      <div className="no-print max-w-5xl mx-auto px-4 mb-6 space-y-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="대시보드로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span>
                  {pageLayout === "a4-single"
                    ? "A4 세로 1장 (전면형) 인쇄 미리보기"
                    : "A4 가로 2쪽 (A5×2 분할형) 인쇄 미리보기"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {pageLayout === "a4-single"
                  ? "A4 세로 1장에 1명분 일기를 시원하게 꽉 채워 넉넉한 필기 공간을 제공합니다."
                  : "A4 가로 1장에 2쪽이 나란히 배치되어 용지를 절약하고 포트폴리오 바인더 철에 최적화되어 있습니다."}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* 용지 규격 선택 토글: A4 1장 vs A4 2쪽 */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPageLayout("a4-single")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  pageLayout === "a4-single"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="A4 1장에 1매 전면 인쇄"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 세로 1장</span>
              </button>
              <button
                type="button"
                onClick={() => setPageLayout("a4-double")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  pageLayout === "a4-double"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="A4 가로 1장에 A5 2쪽 분할 인쇄"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>A4 가로 2쪽 (A5×2)</span>
              </button>
            </div>

            {/* 인쇄 모드 전환 토글 */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPrintMode("filled")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  printMode === "filled"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                답변 인쇄 (포트폴리오)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode("blank")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  printMode === "blank"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                줄노트 빈칸 (수기 작성용)
              </button>
            </div>

            {/* 인쇄 실행 버튼 */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={printItems.length === 0}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>지금 인쇄하기</span>
            </button>
          </div>
        </div>

        {/* 하단 보조 옵션 바 */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3">
          {printMode === "filled" ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center space-x-1 font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
              >
                {selectedIds.length === entries.length && entries.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>전체 선택 ({printItems.length}/{entries.length}명)</span>
              </button>
            </div>
          ) : (
            <div className="text-slate-600 text-xs font-medium flex items-center space-x-2">
              <span className="font-bold text-slate-800">✍️ 수기 작성용 활동지 인쇄:</span>
              <span>
                {selectedIds.length > 0 && entries.length > 0
                  ? `선택된 ${selectedIds.length}명의 학번/이름이 인쇄된 빈 활동지`
                  : "학번·이름을 비워둔 공통 빈 활동지 양식"}
              </span>
            </div>
          )}

          <div className="text-slate-500 font-medium">
            총 <strong className="text-blue-600">{sheets.length}장</strong>의 A4 용지 (
            {pageLayout === "a4-single" ? "세로 1장 전면형" : "가로 2쪽 분할형"})가 출력됩니다.
            <span className="ml-2 text-slate-400 text-[11px]">
              (※ 장수 설정은 인쇄 대화창의 &apos;인쇄 매수&apos;를 이용하세요)
            </span>
          </div>
        </div>
      </div>

      {/* 인쇄용 시트 컨테이너 */}
      <div
        className={`mx-auto space-y-8 print:space-y-0 px-4 print:px-0 ${
          pageLayout === "a4-single" ? "max-w-[210mm]" : "max-w-[297mm]"
        }`}
      >
        {sheets.length === 0 ? (
          <div className="no-print p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-slate-700 font-bold text-sm">출력할 인쇄 내용이 없습니다.</p>
            <p className="text-xs text-slate-500">
              상단의 <strong>[줄노트 빈칸 (수기 작성용)]</strong> 버튼을 누르면 즉시 수기용 빈 활동지를 인쇄할 수 있습니다.
            </p>
          </div>
        ) : (
          sheets.map((sheetItems, sheetIdx) => (
            <div
              key={sheetIdx}
              className={`print-sheet bg-white rounded-2xl print:rounded-none border print:border-none border-slate-300 p-6 print:p-0 shadow-md print:shadow-none ${
                pageLayout === "a4-single"
                  ? "min-h-[265mm] block space-y-0"
                  : "min-h-[190mm] grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-[10mm]"
              }`}
            >
              {sheetItems.map((entry) =>
                pageLayout === "a4-single" ? (
                  /* ======================================================== */
                  /* A4 세로 1장 (전면형) 카드                                 */
                  /* ======================================================== */
                  <div
                    key={entry.id}
                    className="print-card-single border-2 border-slate-400 rounded-2xl p-6 flex flex-col justify-between bg-white text-slate-900 box-border leading-normal"
                    style={{ minHeight: "260mm" }}
                  >
                    <div>
                      {/* 헤더: 대제목 및 인적사항 표 */}
                      <div className="border-b-2 border-slate-900 pb-3 mb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2">
                            <span>📐</span>
                            <span>수학 수업 성찰 일기</span>
                          </h3>
                          <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {entry.date} · {entry.className}
                          </span>
                        </div>

                        {/* 인적사항 및 단원 메타정보 */}
                        <div className="grid grid-cols-4 gap-2 mt-3 text-xs bg-slate-50 border border-slate-300 p-2.5 rounded-lg">
                          <div>
                            <span className="font-bold text-slate-700">과목:</span>{" "}
                            <span className="font-semibold text-slate-900">{entry.subject}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">담당교사:</span>{" "}
                            <span className="font-semibold text-slate-900">{entry.teacherName}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">학번:</span>{" "}
                            <span className="font-bold text-blue-700">{entry.studentNumber}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700">이름:</span>{" "}
                            <span className="font-bold text-blue-700">{entry.studentName}</span>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-slate-800 bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-lg">
                          <strong className="font-bold text-blue-900">학습 단원:</strong>{" "}
                          <span className="text-slate-900 font-semibold">
                            {entry.chapter.major} &gt; {entry.chapter.minor} ({entry.chapter.topic})
                          </span>
                        </div>
                      </div>

                      {/* 4대 핵심 질문 영역 (A4 세로 전면: 넉넉한 줄노트 필기 공간) */}
                      <div className="space-y-4">
                        {/* 질문 1 */}
                        <div className="border border-slate-300 rounded-xl p-3.5 bg-white shadow-2xs">
                          <div className="font-bold text-slate-900 mb-2 flex items-center space-x-2 text-xs sm:text-sm">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold shrink-0">
                              1
                            </span>
                            <span>오늘 수업에서 다룬 핵심 개념이나 공식은 무엇인가요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.concept ? (
                            <p className="text-slate-800 pl-7 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                              {entry.answers.concept}
                            </p>
                          ) : (
                            <div
                              className="lined-paper pl-7 pt-1 text-slate-400"
                              style={{ minHeight: "105px", lineHeight: "35px" }}
                            />
                          )}
                        </div>

                        {/* 질문 2 */}
                        <div className="border border-slate-300 rounded-xl p-3.5 bg-white shadow-2xs">
                          <div className="font-bold text-slate-900 mb-2 flex items-center space-x-2 text-xs sm:text-sm">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold shrink-0">
                              2
                            </span>
                            <span>내가 친구에게 쉽게 설명해 준다면 어떻게 말할 수 있을까요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.explained ? (
                            <p className="text-slate-800 pl-7 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                              {entry.answers.explained}
                            </p>
                          ) : (
                            <div
                              className="lined-paper pl-7 pt-1 text-slate-400"
                              style={{ minHeight: "105px", lineHeight: "35px" }}
                            />
                          )}
                        </div>

                        {/* 질문 3 */}
                        <div className="border border-slate-300 rounded-xl p-3.5 bg-white shadow-2xs">
                          <div className="font-bold text-slate-900 mb-2 flex items-center space-x-2 text-xs sm:text-sm">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold shrink-0">
                              3
                            </span>
                            <span>오늘 새롭게 깨달았거나, 헷갈렸다가 풀린 부분은 무엇인가요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.discovered ? (
                            <p className="text-slate-800 pl-7 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                              {entry.answers.discovered}
                            </p>
                          ) : (
                            <div
                              className="lined-paper pl-7 pt-1 text-slate-400"
                              style={{ minHeight: "105px", lineHeight: "35px" }}
                            />
                          )}
                        </div>

                        {/* 질문 4 */}
                        <div className="border border-slate-300 rounded-xl p-3.5 bg-white shadow-2xs">
                          <div className="font-bold text-slate-900 mb-2 flex items-center space-x-2 text-xs sm:text-sm">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold shrink-0">
                              4
                            </span>
                            <span>더 확실히 내 것으로 만들기 위해 오늘 방과 후에 무엇을 해볼까요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.plan ? (
                            <p className="text-slate-800 pl-7 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                              {entry.answers.plan}
                            </p>
                          ) : (
                            <div
                              className="lined-paper pl-7 pt-1 text-slate-400"
                              style={{ minHeight: "105px", lineHeight: "35px" }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 하단 확인 및 피드백 서명란 */}
                    <div className="pt-3 border-t-2 border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-700 font-medium">
                      <span>작성 확인: 학생 ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 서명 )</span>
                      <span>교사 피드백 및 날인: ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 서명/인 )</span>
                    </div>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* A4 가로 2쪽 (A5×2 분할형) 카드                             */
                  /* ======================================================== */
                  <div
                    key={entry.id}
                    className="print-card-double border-1.5 border-slate-400 rounded-xl p-4 flex flex-col justify-between bg-white text-slate-900 box-border text-[11px] leading-tight"
                    style={{ minHeight: "185mm" }}
                  >
                    <div>
                      {/* A5 헤더 */}
                      <div className="border-b-2 border-slate-800 pb-2 mb-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
                            수학 수업 성찰 일기
                          </h3>
                          <span className="text-[10px] text-slate-600 font-medium">
                            {entry.date} ({entry.className})
                          </span>
                        </div>

                        {/* 인적사항 표 */}
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

                      {/* 4대 핵심 질문 영역 (컴팩트 분할형) */}
                      <div className="space-y-2">
                        {/* 질문 1 */}
                        <div className="border border-slate-300 rounded p-2 bg-white">
                          <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold shrink-0">
                              1
                            </span>
                            <span>오늘 수업에서 다룬 핵심 개념이나 공식은 무엇인가요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.concept ? (
                            <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed whitespace-pre-line">
                              {entry.answers.concept}
                            </p>
                          ) : (
                            <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]" style={{ minHeight: "70px", lineHeight: "25px" }} />
                          )}
                        </div>

                        {/* 질문 2 */}
                        <div className="border border-slate-300 rounded p-2 bg-white">
                          <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold shrink-0">
                              2
                            </span>
                            <span>내가 친구에게 쉽게 설명해 준다면 어떻게 말할 수 있을까요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.explained ? (
                            <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed whitespace-pre-line">
                              {entry.answers.explained}
                            </p>
                          ) : (
                            <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]" style={{ minHeight: "70px", lineHeight: "25px" }} />
                          )}
                        </div>

                        {/* 질문 3 */}
                        <div className="border border-slate-300 rounded p-2 bg-white">
                          <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold shrink-0">
                              3
                            </span>
                            <span>오늘 새롭게 깨달았거나, 헷갈렸다가 풀린 부분은 무엇인가요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.discovered ? (
                            <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed whitespace-pre-line">
                              {entry.answers.discovered}
                            </p>
                          ) : (
                            <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]" style={{ minHeight: "70px", lineHeight: "25px" }} />
                          )}
                        </div>

                        {/* 질문 4 */}
                        <div className="border border-slate-300 rounded p-2 bg-white">
                          <div className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center font-bold shrink-0">
                              4
                            </span>
                            <span>더 확실히 내 것으로 만들기 위해 오늘 방과 후에 무엇을 해볼까요?</span>
                          </div>
                          {printMode === "filled" && entry.answers.plan ? (
                            <p className="text-slate-800 pl-5 text-[10.5px] leading-relaxed whitespace-pre-line">
                              {entry.answers.plan}
                            </p>
                          ) : (
                            <div className="lined-paper pl-5 pt-1 text-slate-400 text-[10px]" style={{ minHeight: "70px", lineHeight: "25px" }} />
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
                )
              )}

              {/* A4 가로 2쪽 모드에서 홀수 개일 때 오른쪽 빈 페이지 플레이스홀더 */}
              {pageLayout === "a4-double" && sheetItems.length === 1 && (
                <div className="print-card-double border-dashed border-2 border-slate-200 rounded-xl p-4 flex items-center justify-center text-slate-400 text-xs">
                  (빈 페이지 - A5 규격 여백)
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
