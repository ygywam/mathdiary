"use client";

import React, { useState } from "react";
import { Lock, X, ArrowRight, ShieldAlert } from "lucide-react";
import { authEngine } from "@/engine/auth";

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authEngine.verifyAdminPin(pin)) {
      setError("");
      setPin("");
      onSuccess();
    } else {
      setError("관리자 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>교사 관리자 인증</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-center space-x-1.5 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              관리자 비밀번호 PIN
            </label>
            <input
              type="password"
              maxLength={12}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              placeholder=""
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center text-lg font-bold"
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
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1"
            >
              <span>관리자 확인</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
