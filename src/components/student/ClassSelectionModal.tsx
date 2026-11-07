"use client";

import React from "react";
import { BookOpen, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { StudentEnrollment } from "@/engine/auth";

interface ClassSelectionModalProps {
  isOpen: boolean;
  studentName: string;
  enrollments: StudentEnrollment[];
  onSelectClass: (classId: string) => void;
  onClose?: () => void;
}

export const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({
  isOpen,
  studentName,
  enrollments,
  onSelectClass,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">수업을 선택해주세요</h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-blue-600">{studentName}</span> 학생이 수강 중인 수업 목록입니다. 오늘 성찰 일기를 작성할 수업을 골라주세요.
          </p>
        </div>

        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
          {enrollments.map((item) => (
            <button
              key={item.classId}
              onClick={() => onSelectClass(item.classId)}
              className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-md transition-all group flex items-center justify-between cursor-pointer"
            >
              <div className="space-y-1">
                <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center space-x-2">
                  <span className="text-sm">{item.className}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>담당: {item.teacherName} 선생님</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-slate-400">
          💡 일기 작성 후 상단 메뉴에서 언제든지 다른 수업으로 전환할 수 있습니다.
        </div>
      </div>
    </div>
  );
};
