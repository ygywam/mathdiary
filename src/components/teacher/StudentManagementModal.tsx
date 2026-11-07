"use client";

import React, { useState, useEffect } from "react";
import { Users, KeyRound, X, CheckCircle2, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { authEngine, StudentAuthRecord } from "@/engine/auth";
import { supabase, isSupabaseConfigured } from "@/engine/supabaseClient";
import { ClassSession } from "@/store/useJournalStore";

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: ClassSession | null;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
  currentClass,
}) => {
  const [students, setStudents] = useState<StudentAuthRecord[]>([]);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const enrollments = authEngine.getEnrollments();
      if (enrollments && enrollments.length > 0) {
        setStudents(enrollments);
      } else {
        const raw = localStorage.getItem("math_reflection_students_v4") || localStorage.getItem("math_reflection_students_v2");
        if (raw) {
          try {
            setStudents(JSON.parse(raw));
          } catch {
            setStudents([]);
          }
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 교사 권한으로 학생 PIN을 1234로 초기화
  const handleResetPin = async (student: StudentAuthRecord) => {
    if (!confirm(`${student.name}(${student.studentNumber}) 학생의 비밀번호 PIN을 [1234]로 초기화하시겠습니까?`)) {
      return;
    }

    const res = authEngine.resetStudentPinByTeacher(student.studentNumber, "1234");
    if (res.success) {
      // Supabase 클라우드 동기화
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from("students")
            .update({ pin: "1234" })
            .eq("student_number", student.studentNumber);
        } catch (err) {
          console.warn("Cloud student PIN reset error:", err);
        }
      }

      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 3000);

      // 로컬 목록 상태 갱신
      setStudents((prev) =>
        prev.map((s) => (s.studentNumber === student.studentNumber ? { ...s, pin: "1234" } : s))
      );
    }
  };

  const filtered = students.filter(
    (s) =>
      s.studentNumber.includes(search.trim()) ||
      s.name.includes(search.trim()) ||
      s.className?.includes(search.trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 text-slate-800 space-y-4 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 font-bold text-base text-slate-900">
            <Users className="w-5 h-5 text-blue-600" />
            <span>학생 명렬 및 비밀번호(PIN) 관리</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          학생이 비밀번호 PIN을 분실한 경우, 해당 학생의 [초기화] 버튼을 누르면 즉시 기본 비밀번호(1234)로 리셋됩니다.
        </p>

        {/* 토스트 알림 */}
        {toastMessage && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 검색창 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="학번 또는 학생 이름 검색"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 학생 목록 테이블 */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {students.length === 0
                ? "등록된 학생 명렬이 없습니다. [명렬표 엑셀 등록]을 먼저 진행해주세요."
                : "검색 결과와 일치하는 학생이 없습니다."}
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-2.5 font-bold">학번</th>
                  <th className="p-2.5 font-bold">이름</th>
                  <th className="p-2.5 font-bold">소속 학급</th>
                  <th className="p-2.5 font-bold text-center">비밀번호 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((st) => (
                  <tr key={`${st.studentNumber}_${st.classId}`} className="hover:bg-slate-50/80">
                    <td className="p-2.5 font-mono font-bold text-slate-800">{st.studentNumber}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{st.name}</td>
                    <td className="p-2.5 text-slate-500 truncate max-w-[120px]">{st.className || "수학"}</td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleResetPin(st)}
                        className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors inline-flex items-center space-x-1"
                        title="비밀번호를 1234로 초기화"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>PIN 초기화 (1234)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
