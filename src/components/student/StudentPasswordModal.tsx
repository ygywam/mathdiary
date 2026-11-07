"use client";

import React, { useState } from "react";
import { Lock, X, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { authEngine } from "@/engine/auth";

interface StudentPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentNumber: string;
  studentName: string;
}

export const StudentPasswordModal: React.FC<StudentPasswordModalProps> = ({
  isOpen,
  onClose,
  studentNumber,
  studentName,
}) => {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== newPinConfirm) {
      setMessage({ type: "error", text: "새 비밀번호 PIN 확인이 일치하지 않습니다." });
      return;
    }
    const res = authEngine.changeStudentPin(studentNumber, currentPin, newPin);
    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setTimeout(() => {
        onClose();
        setMessage(null);
        setCurrentPin("");
        setNewPin("");
        setNewPinConfirm("");
      }, 1500);
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 text-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 font-bold text-base text-slate-900">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <span>비밀번호 PIN 변경</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          <strong>{studentName}</strong> ({studentNumber}) 학생의 로그인 비밀번호를 변경합니다.
        </p>

        {message && (
          <div
            className={`p-2.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">현재 PIN</label>
            <input
              type="password"
              maxLength={8}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">새 PIN (4자리 이상)</label>
            <input
              type="password"
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">새 PIN 확인</label>
            <input
              type="password"
              maxLength={8}
              value={newPinConfirm}
              onChange={(e) => setNewPinConfirm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center"
              required
            />
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              변경 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
