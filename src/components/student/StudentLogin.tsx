"use client";

import React, { useState } from "react";
import { Lock, Hash, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

interface StudentLoginProps {
  onLogin: (studentNumber: string, pin: string, name: string, classCode: string) => void;
  defaultClassCode?: string;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onLogin,
  defaultClassCode = "MTH-203",
}) => {
  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [classCode, setClassCode] = useState(defaultClassCode);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNumber.trim()) {
      setError("학번(예: 20315)을 입력해주세요.");
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError("비밀번호(숫자 4자리)를 입력해주세요.");
      return;
    }
    if (!classCode.trim()) {
      setError("선생님이 알려주신 수업코드(예: MTH-203)를 입력해주세요.");
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
        <h2 className="text-xl font-bold text-slate-800">학생 간편 시작하기</h2>
        <p className="text-xs text-slate-500 mt-1">
          개인정보(이메일·연락처) 없이 학번과 PIN 번호로 안전하게 시작합니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 수업코드 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            수업코드 (선생님이 알려주신 고유 코드)
          </label>
          <div className="relative">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="예: MTH-203"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-bold text-blue-700"
            />
          </div>
        </div>

        {/* 학번 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            학번 (5자리 권장)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="예: 20315 (2학년 3반 15번)"
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 이름 (선택/가명 가능) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            이름 또는 닉네임 <span className="text-slate-400 font-normal">(선택)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 김수학 (미입력 시 학번으로 표시)"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 4자리 숫자 PIN */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            비밀번호 PIN (숫자 4자리)
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
              placeholder="•••• (나만 아는 비밀번호)"
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            * 다른 친구는 내 일기를 볼 수 없으며 오직 나만 열람할 수 있습니다.
          </p>
        </div>

        <button
          type="submit"
          className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
        >
          <span>수업 입장 & 성찰 일기 쓰기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>개인정보 안심 보호 시스템 적용 중</span>
      </div>
    </div>
  );
};
