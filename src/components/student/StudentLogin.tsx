"use client";

import React, { useState } from "react";
import { Lock, Hash, KeyRound, ArrowRight, User } from "lucide-react";

interface StudentLoginProps {
  onLogin: (studentNumber: string, pin: string, name: string, classCode: string) => void;
  defaultClassCode?: string;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onLogin,
  defaultClassCode = "",
}) => {
  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [classCode, setClassCode] = useState(defaultClassCode);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError("수업코드를 입력해주세요.");
      return;
    }
    if (!studentNumber.trim()) {
      setError("학번을 입력해주세요.");
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError("비밀번호 PIN(4자리)을 입력해주세요.");
      return;
    }
    setError("");
    onLogin(studentNumber.trim(), pin.trim(), name.trim(), classCode.trim());
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">학생 로그인</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 수업코드 */}
        <div data-tour="tour-class-code">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            수업코드
          </label>
          <input
            type="text"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder=""
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-bold text-blue-700"
          />
        </div>

        {/* 학번 */}
        <div data-tour="tour-student-number">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            학번
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder=""
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 이름 */}
        <div data-tour="tour-student-name">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            이름
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 4자리 숫자 PIN */}
        <div data-tour="tour-student-pin">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            비밀번호 PIN
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder=""
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
            />
          </div>
        </div>

        <button
          type="submit"
          data-tour="tour-login-btn"
          className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
        >
          <span>입장하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
