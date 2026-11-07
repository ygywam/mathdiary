"use client";

import React, { useState } from "react";
import { Download, Upload, X, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/engine/supabaseClient";
import { journalStore, ClassSession } from "@/store/useJournalStore";
import { authEngine } from "@/engine/auth";

interface RosterUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: ClassSession | null;
  onSuccess: () => void;
}

export const RosterUploadModal: React.FC<RosterUploadModalProps> = ({
  isOpen,
  onClose,
  currentClass,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  // 1. 기본 엑셀(CSV) 양식 다운로드 (UTF-8 BOM 포함으로 엑셀 한글 깨짐 방지)
  const handleDownloadTemplate = () => {
    const csvContent =
      "\uFEFF학번,이름,학급명,교사명,과목,초기비밀번호\n" +
      "10101,김수학,1학년 1반 수학,수학교사,공통수학1,1234\n" +
      "10102,이방정,1학년 1반 수학,수학교사,공통수학1,1234\n" +
      "10103,박도형,1학년 1반 수학,수학교사,공통수학1,1234\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "수업성찰일기_학생명렬표_기본양식.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. 엑셀(CSV) 파일 업로드 및 수파베이스(Supabase) 직접 저장
  const handleUploadRoster = async () => {
    if (!file) {
      setResultMessage({ type: "error", text: "업로드할 CSV 파일을 먼저 선택해주세요." });
      return;
    }

    setIsUploading(true);
    setResultMessage(null);

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        throw new Error("데이터가 없는 빈 파일이거나 서식이 올바르지 않습니다.");
      }

      // 첫 번째 줄 헤더 검증
      const header = lines[0].replace("\uFEFF", "").split(",");
      if (!header[0]?.includes("학번") || !header[1]?.includes("이름")) {
        throw new Error("CSV 헤더 첫 두 항목은 [학번, 이름]이어야 합니다. 기본 양식을 내려받아 작성해주세요.");
      }

      const rows = lines.slice(1);
      const parsedStudents: Array<{
        studentNumber: string;
        name: string;
        className: string;
        teacherName: string;
        subject: string;
        pin: string;
      }> = [];

      for (const line of rows) {
        const cols = line.split(",").map((c) => c.trim());
        if (cols.length >= 2 && cols[0]) {
          parsedStudents.push({
            studentNumber: cols[0],
            name: cols[1] || `학생_${cols[0]}`,
            className: cols[2] || (currentClass?.name || "수학 수업"),
            teacherName: cols[3] || (currentClass?.teacherName || "수학교사"),
            subject: cols[4] || (currentClass?.subject || "수학"),
            pin: cols[5] || "1234",
          });
        }
      }

      if (parsedStudents.length === 0) {
        throw new Error("유효한 학생 데이터 행을 찾을 수 없습니다.");
      }

      // 3. Supabase 클라우드 저장 시도
      let cloudSavedCount = 0;
      if (isSupabaseConfigured && supabase) {
        // 현재 수업 또는 기본 수업 생성/확보
        let targetClassId = currentClass?.id;

        if (!targetClassId) {
          const sample = parsedStudents[0];
          const newCode = `MTH-${Math.floor(100 + Math.random() * 900)}`;
          const { data: createdClass, error: classErr } = await supabase
            .from("classes")
            .insert({
              name: sample.className,
              teacher: sample.teacherName,
              subject: sample.subject,
              code: newCode,
              active_chapter: { major: "Ⅰ. 다항식", minor: "1. 다항식의 연산", topic: "다항식의 덧셈과 뺄셈" },
            })
            .select("id")
            .single();

          if (!classErr && createdClass) {
            targetClassId = createdClass.id;
          }
        }

        // 학생 명렬 Supabase students 테이블에 등록
        const studentRows = parsedStudents.map((s) => ({
          student_number: s.studentNumber,
          name: s.name,
          pin: s.pin,
          class_id: targetClassId,
        }));

        const { error: studentErr } = await supabase
          .from("students")
          .upsert(studentRows, { onConflict: "student_number,class_id" });

        if (!studentErr) {
          cloudSavedCount = studentRows.length;
        }
      }

      // 4. 로컬 스토리지 동기화 및 수업 확보
      const targetClassId = currentClass?.id || "cls_default";
      const targetClassName = currentClass?.name || parsedStudents[0].className;
      const targetTeacherId = currentClass?.teacherId || "tch_default";
      const targetTeacherName = currentClass?.teacherName || parsedStudents[0].teacherName;

      // authEngine에 학생-수업 매칭 등록 (고교학점제 다중 수업 지원)
      authEngine.enrollStudentsToClass(
        targetClassId,
        targetClassName,
        targetTeacherId,
        targetTeacherName,
        parsedStudents.map((s) => ({
          studentNumber: s.studentNumber,
          name: s.name,
          pin: s.pin,
        }))
      );

      parsedStudents.forEach((st) => {
        journalStore.registerStudentFallback({
          studentNumber: st.studentNumber,
          name: st.name,
          pin: st.pin,
          classId: targetClassId,
          className: targetClassName,
        });
      });

      setResultMessage({
        type: "success",
        text: `총 ${parsedStudents.length}명의 학생 명렬이 ${
          cloudSavedCount > 0 ? "수파베이스 클라우드 DB에" : "시스템에"
        } 안전하게 영구 저장되었습니다!`,
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setResultMessage({
        type: "error",
        text: err?.message || "파일 처리 중 오류가 발생했습니다.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 font-bold text-base text-slate-900">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>학생 명렬표 엑셀 등록 (수파베이스 연동)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 설명 */}
        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          학생 명단을 엑셀(CSV)로 일괄 업로드하면 개별 가입 없이 수파베이스 클라우드에 전교생 계정이 즉시 세팅되며, 학생들은 수업코드와 학번으로 바로 일기를 작성할 수 있습니다.
        </p>

        {/* 1. 기본 양식 다운로드 버튼 */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">1. 엑셀 기본 서식 받기</span>
            <span className="text-[11px] text-slate-500">학번, 이름, 학급, 초기비밀번호 샘플 포함</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>양식 다운로드</span>
          </button>
        </div>

        {/* 2. 파일 업로드 영역 */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            2. 작성한 CSV 명렬 파일 선택
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
                setResultMessage(null);
              }
            }}
            className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-xl p-2 bg-slate-50"
          />
        </div>

        {/* 상태 메시지 */}
        {resultMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-medium flex items-center space-x-2 border ${
              resultMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {resultMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        )}

        {/* 하단 버튼 바 */}
        <div className="mt-6 flex space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!file || isUploading}
            onClick={handleUploadRoster}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 ${
              !file || isUploading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>클라우드 저장 중...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>수파베이스에 일괄 저장</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
