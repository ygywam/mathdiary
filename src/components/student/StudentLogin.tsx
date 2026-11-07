"use client";

import React, { useState } from "react";
import { Lock, Hash, KeyRound, ArrowRight } from "lucide-react";

interface StudentLoginProps {
  onLogin: (studentNumber: string, pin: string) => void;
  isLoading?: boolean;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onLogin,
  isLoading = false,
}) => {
  const [studentNumber, setStudentNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNumber.trim()) {
      setError("학번을 입력해주세요.");
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError("비밀번호 PIN(4자리)을 입력해주세요.");
      return;
    }
    setError("");
    onLogin(studentNumber.trim(), pin.trim());
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">학생 성찰 시작하기</h2>
        <p className="text-xs text-slate-500 mt-1">학번과 비밀번호 PIN으로 간편하게 시작합니다.</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 font-medium leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 학번 */}
        <div data-tour="tour-student-number">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            학번
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="예: 20315"
              autoComplete="username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* 비밀번호 PIN */}
        <div data-tour="tour-pin">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            비밀번호 PIN (숫자 4자리)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="숫자 4자리"
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          data-tour="tour-login-btn"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer mt-2"
        >
          <span>{isLoading ? "확인 중..." : "수업 입장 및 일기 쓰기"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
