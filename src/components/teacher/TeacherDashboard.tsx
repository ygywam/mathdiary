"use client";

import React, { useState } from "react";
import { ClassSession, ReflectionEntry } from "@/store/useJournalStore";
import { filterEngine, FilterOptions } from "@/engine/filter";
import {
  Calendar,
  User,
  BookOpen,
  Search,
  Printer,
  PlusCircle,
  Copy,
  Check,
  Award,
  Sparkles,
} from "lucide-react";

interface TeacherDashboardProps {
  currentClass: ClassSession;
  allClasses: ClassSession[];
  entries: ReflectionEntry[];
  onSelectClass: (cls: ClassSession) => void;
  onOpenClassSetup: () => void;
  onGoToPrint: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentClass,
  allClasses,
  entries,
  onSelectClass,
  onOpenClassSetup,
  onGoToPrint,
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    date: "all",
    studentId: "all",
    majorChapter: "all",
    searchQuery: "",
  });

  const [copiedCode, setCopiedCode] = useState(false);

  // 필터링 적용된 일기 목록
  const filteredEntries = filterEngine.filterEntries(entries, filterOptions);

  // 필터 옵션용 고유 목록
  const uniqueDates = filterEngine.getUniqueDates(entries);
  const uniqueMajors = filterEngine.getUniqueMajorChapters(entries);
  const studentStats = filterEngine.getStudentStats(entries);

  // 수업코드 복사
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentClass.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 상단 수업 현황 헤더 카드 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <select
              value={currentClass.id}
              onChange={(e) => {
                const found = allClasses.find((c) => c.id === e.target.value);
                if (found) onSelectClass(found);
              }}
              className="text-base sm:text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>

            <button
              onClick={onOpenClassSetup}
              className="flex items-center space-x-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors border border-blue-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새 수업 개설</span>
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>담당: {currentClass.teacherName}</span>
            <span>·</span>
            <span>과목: {currentClass.subject}</span>
            <span>·</span>
            <span className="font-semibold text-blue-600">
              오늘 진도: {currentClass.activeChapter.minor}
            </span>
          </div>
        </div>

        {/* 대형 수업코드 및 통계 */}
        <div className="flex items-center space-x-4">
          {/* 수업코드 카드 (프로젝터용 대형 표시) */}
          <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl flex items-center space-x-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                학급 고정 수업코드
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-blue-800 tracking-widest">
                {currentClass.code}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              title="수업코드 복사"
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
            >
              {copiedCode ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* 인쇄 바로가기 버튼 */}
          <button
            onClick={onGoToPrint}
            className="flex items-center space-x-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>A4 가로 2쪽 인쇄</span>
          </button>
        </div>
      </div>

      {/* 3단 다차원 필터링 바 (날짜, 학생, 단원, 검색어) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>다차원 조건 필터링 (생기부 과세특 및 수업 분석)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. 날짜 필터 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              value={filterOptions.date}
              onChange={(e) =>
                setFilterOptions((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 수업일 ({uniqueDates.length}일)</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 학생 필터 (생기부 작성용) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <select
              value={filterOptions.studentId}
              onChange={(e) =>
                setFilterOptions((prev) => ({ ...prev, studentId: e.target.value }))
              }
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 학생 보기 ({studentStats.length}명)</option>
              {studentStats.map((st) => (
                <option key={st.studentId} value={st.studentId}>
                  {st.number} {st.name} ({st.count}편 작성)
                </option>
              ))}
            </select>
          </div>

          {/* 3. 단원 필터 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <select
              value={filterOptions.majorChapter}
              onChange={(e) =>
                setFilterOptions((prev) => ({ ...prev, majorChapter: e.target.value }))
              }
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 단원</option>
              {uniqueMajors.map((maj) => (
                <option key={maj} value={maj}>
                  {maj}
                </option>
              ))}
            </select>
          </div>

          {/* 4. 내용 / 이름 검색창 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filterOptions.searchQuery}
              onChange={(e) =>
                setFilterOptions((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="학생명 또는 '판별식' 등 검색"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 필터링 결과 현황 및 일기 카드 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            검색 결과: <strong className="text-blue-600 font-bold">{filteredEntries.length}</strong>건의 성찰 일기
          </span>
          {filterOptions.studentId !== "all" && (
            <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1">
              <Award className="w-3.5 h-3.5" />
              <span>특정 학생 1인 누적 모아보기 모드 활성화 중</span>
            </span>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">해당 조건의 성찰 일기가 없습니다</h4>
            <p className="text-xs text-slate-500 mt-1">
              필터 조건을 재설정하거나 학생들에게 수업코드({currentClass.code})를 공유해주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  {/* 카드 헤더 */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">
                      {entry.studentNumber} {entry.studentName}
                    </span>
                    <span className="text-[11px] text-slate-400">{entry.date}</span>
                  </div>

                  {/* 단원 정보 */}
                  <div className="py-2">
                    <span className="text-[11px] font-semibold text-blue-600 block truncate">
                      {entry.chapter.major}
                    </span>
                    <span className="text-xs font-bold text-slate-700 block truncate">
                      {entry.chapter.minor}
                    </span>
                  </div>

                  {/* 4대 답변 간략 뷰 */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="font-semibold text-slate-600 block text-[11px] mb-0.5">
                        배운 개념
                      </span>
                      <p className="text-slate-800 line-clamp-2">{entry.answers.concept}</p>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="font-semibold text-slate-600 block text-[11px] mb-0.5">
                        이해한 내용
                      </span>
                      <p className="text-slate-800 line-clamp-2">{entry.answers.explained}</p>
                    </div>

                    <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                      <span className="font-semibold text-amber-800 block text-[11px] mb-0.5">
                        새롭게 알게 된 점 / 풀린 부분
                      </span>
                      <p className="text-amber-950 line-clamp-2">{entry.answers.discovered}</p>
                    </div>

                    <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                      <span className="font-semibold text-blue-800 block text-[11px] mb-0.5">
                        앞으로의 계획
                      </span>
                      <p className="text-blue-950 line-clamp-2">{entry.answers.plan}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>작성 시각: {entry.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
