"use client";

import React, { useState } from "react";
import curriculumData from "@/data/mathCurriculum.json";
import { classCodeEngine } from "@/engine/classCode";
import { ClassSession } from "@/store/useJournalStore";
import { X, Sparkles, BookOpen, KeyRound, Check } from "lucide-react";

interface ClassSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClass: (newClass: ClassSession) => void;
  teacherName: string;
}

export const ClassSetupModal: React.FC<ClassSetupModalProps> = ({
  isOpen,
  onClose,
  onSaveClass,
  teacherName,
}) => {
  const [selectedGradeId, setSelectedGradeId] = useState("high");
  const [selectedSubjectId, setSelectedSubjectId] = useState("common-math-1");
  const [className, setClassName] = useState("");
  const [currentTeacherName, setCurrentTeacherName] = useState(
    teacherName && teacherName !== "담당교사" && !teacherName.includes("박수학") ? teacherName : ""
  );
  const [classCode, setClassCode] = useState(classCodeEngine.generateCode("MTH"));

  // 활성 단원 선택
  const [major, setMajor] = useState("Ⅱ. 방정식과 부등식");
  const [minor, setMinor] = useState("1. 복소수와 이차방정식");
  const [topic, setTopic] = useState("이차방정식의 판별식 D와 실근·허근");

  if (!isOpen) return null;

  const currentGrade = curriculumData.grades.find((g) => g.id === selectedGradeId);
  const currentSubject = currentGrade?.subjects.find((s) => s.id === selectedSubjectId);

  const handleSelectTopic = (maj: string, min: string, top: string) => {
    setMajor(maj);
    setMinor(min);
    setTopic(top);
  };

  const handleGenerateNewCode = () => {
    setClassCode(classCodeEngine.generateCode("MTH"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      alert("학급 또는 수업 이름을 입력해주세요.");
      return;
    }
    if (!currentTeacherName.trim()) {
      alert("담당 교사명을 입력해주세요.");
      return;
    }

    const newClass: ClassSession = {
      id: `cls_${Date.now()}`,
      teacherId: `tch_${Date.now()}`,
      teacherName: currentTeacherName.trim(),
      name: className.trim(),
      code: classCode.trim().toUpperCase(),
      grade: currentGrade?.name || "고등학교",
      subject: currentSubject?.name || "공통수학1",
      activeChapter: {
        major,
        minor,
        topic,
      },
      createdAt: new Date().toISOString().split("T")[0],
    };

    onSaveClass(newClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* 모달 헤더 */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>새 수학 수업 개설 & 교육과정 자동완성</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              학년과 과목을 고르고 오늘 진도 단원을 1클릭하면 바로 채워집니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 수업 기본 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                학급 / 수업 이름
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                담당 교사명
              </label>
              <input
                type="text"
                value={currentTeacherName}
                onChange={(e) => setCurrentTeacherName(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>학기 고정 수업코드</span>
                <button
                  type="button"
                  onClick={handleGenerateNewCode}
                  className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>새 코드</span>
                </button>
              </label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-blue-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
          </div>

          {/* 교육과정 선택 (학년 및 과목) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                학교급 선택
              </label>
              <select
                value={selectedGradeId}
                onChange={(e) => {
                  setSelectedGradeId(e.target.value);
                  const grp = curriculumData.grades.find((g) => g.id === e.target.value);
                  if (grp && grp.subjects.length > 0) {
                    setSelectedSubjectId(grp.subjects[0].id);
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {curriculumData.grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                수학 과목 선택 (2022 개정)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentGrade?.subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 1클릭 단원 자동완성 트리 */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>오늘의 수업 단원 1클릭 선택</span>
              </label>
              <span className="text-[11px] text-slate-500">
                원하는 주제를 클릭하면 아래에 즉시 자동 채워집니다.
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl max-h-48 overflow-y-auto p-3 bg-slate-50 space-y-3">
              {currentSubject?.chapters.map((ch, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
                    {ch.major}
                  </div>
                  <div className="pl-2 space-y-1">
                    {ch.minors.map((min, mIdx) => (
                      <div key={mIdx} className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-600">
                          {min.name}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {min.topics.map((top, tIdx) => {
                            const isSelected = topic === top;
                            return (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => handleSelectTopic(ch.major, min.name, top)}
                                className={`text-[11px] px-2 py-1 rounded-lg border transition-all text-left flex items-center space-x-1 ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                <span>{top}</span>
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

          {/* 최종 선택된 단원 확인 및 커스텀 수정 */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
            <span className="text-xs font-bold text-blue-900 block">
              선택된 단원 정보 (필요 시 수정 가능)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="대단원"
                className="p-2 bg-white border border-blue-200 rounded-lg text-slate-800"
              />
              <input
                type="text"
                value={minor}
                onChange={(e) => setMinor(e.target.value)}
                placeholder="중단원"
                className="p-2 bg-white border border-blue-200 rounded-lg text-slate-800"
              />
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="학습 주제 / 공식"
              className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs text-slate-800"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              수업 개설 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
