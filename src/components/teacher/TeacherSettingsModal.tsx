"use client";

import React, { useState } from "react";
import { Settings, Lock, User, X, CheckCircle2, AlertCircle } from "lucide-react";
import { authEngine } from "@/engine/auth";
import { ClassSession } from "@/store/useJournalStore";

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: ClassSession | null;
  onClassUpdated: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  currentClass,
  onClassUpdated,
}) => {
  const session = authEngine.getCurrentSession();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPassConfirm, setNewPassConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || session.role !== "teacher") {
      setMessage({ type: "error", text: "교사 세션 정보가 없습니다." });
      return;
    }
    if (newPass !== newPassConfirm) {
      setMessage({ type: "error", text: "새 비밀번호 확인이 일치하지 않습니다." });
      return;
    }
    if (newPass.length < 4) {
      setMessage({ type: "error", text: "새 비밀번호는 4자리 이상이어야 합니다." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const res = await authEngine.changeTeacherPassword(session.userId, currentPass, newPass);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setCurrentPass("");
      setNewPass("");
      setNewPassConfirm("");
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 font-bold text-base text-slate-900">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>선생님 계정 설정</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 현재 로그인 교사 정보 */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{session?.name || "선생님"}</div>
            <div className="text-xs text-blue-700">고유 교사 ID: {session?.userId}</div>
          </div>
        </div>

        {/* 비밀번호 변경 폼 */}
        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>선생님 비밀번호 변경</span>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-600 mb-1">현재 비밀번호</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="현재 비밀번호 입력"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-600 mb-1">새 비밀번호</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="4자리 이상"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">새 비밀번호 확인</label>
              <input
                type="password"
                value={newPassConfirm}
                onChange={(e) => setNewPassConfirm(e.target.value)}
                placeholder="한 번 더 입력"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            {isLoading ? "변경 중..." : "비밀번호 변경하기"}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
