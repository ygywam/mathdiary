"use client";

import React, { useState } from "react";
import curriculumData from "@/data/mathCurriculum.json";
import { ChapterInfo, ClassSession } from "@/store/useJournalStore";
import { X, BookOpen, Check, Sparkles } from "lucide-react";

interface ChapterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: ClassSession;
  onUpdateChapter: (newChapter: ChapterInfo) => void;
}

export const ChapterSelectModal: React.FC<ChapterSelectModalProps> = ({
  isOpen,
  onClose,
  currentClass,
  onUpdateChapter,
}) => {
  // 현재 과목에 해당하는 교육과정 탐색 (일치하는 과목 없으면 첫 번째 고교 과목)
  const allSubjects = curriculumData.grades.flatMap((g) =>
    g.subjects.map((s) => ({ ...s, gradeName: g.name }))
  );
  const matchedSubject =
    allSubjects.find((s) => s.name === currentClass.subject || currentClass.subject.includes(s.name)) ||
    allSubjects[0];

  const [selectedSubjectId, setSelectedSubjectId] = useState(matchedSubject.id);

  const activeSubject =
    allSubjects.find((s) => s.id === selectedSubjectId) || matchedSubject;

  const [selectedMajor, setSelectedMajor] = useState(currentClass.activeChapter.major);
  const [selectedMinor, setSelectedMinor] = useState(currentClass.activeChapter.minor);
  const [selectedTopic, setSelectedTopic] = useState(currentClass.activeChapter.topic);

  if (!isOpen) return null;

  const handleSelectTopic = (maj: string, min: string, top: string) => {
    setSelectedMajor(maj);
    setSelectedMinor(min);
    setSelectedTopic(top);
  };

  const handleApply = () => {
    onUpdateChapter({
      major: selectedMajor,
      minor: selectedMinor,
      topic: selectedTopic,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 모달 헤더 */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>오늘 진도 단원 변경 ({currentClass.name})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              수업을 새로 개설할 필요 없이, 매 차시 배울 단원만 선택하면 학생 화면에 즉시 반영됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 과목 전환 (필요 시) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              교육과정 과목 기준 (2022 개정 수학과)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.gradeName}] {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 단원 트리 1클릭 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>오늘 진도 단원 1클릭 선택</span>
              </span>
              <span className="text-[11px] text-slate-400">
                원하는 소주제 버튼을 누르면 즉시 선택됩니다.
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 max-h-56 overflow-y-auto space-y-4">
              {activeSubject?.chapters?.map((maj) => (
                <div key={maj.major} className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                    {maj.major}
                  </div>
                  <div className="space-y-2 pl-2">
                    {maj.minors.map((min) => (
                      <div key={min.name} className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-600">
                          • {min.name}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-2">
                          {min.topics.map((top) => {
                            const isSelected =
                              selectedMajor === maj.major &&
                              selectedMinor === min.name &&
                              selectedTopic === top;
                            return (
                              <button
                                key={top}
                                type="button"
                                onClick={() => handleSelectTopic(maj.major, min.name, top)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                                  isSelected
                                    ? "bg-blue-600 text-white shadow-xs font-bold ring-2 ring-blue-300"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600"
                                }`}
                              >
                                {isSelected ? `✓ ${top}` : top}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 선택된 단원 확인 카드 */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-blue-800 block">
              ✓ 오늘 수업 진도로 확정할 단원
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-800">
              {selectedMajor} &gt; {selectedMinor}
            </div>
            <p className="text-xs text-blue-700 font-semibold">{selectedTopic}</p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end space-x-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>오늘 진도 단원으로 적용하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
