"use client";

import React, { useState } from "react";
import { Lock, X, ArrowRight, ShieldAlert, UserCheck, UserPlus, KeyRound } from "lucide-react";
import { authEngine, UserSession } from "@/engine/auth";

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: UserSession) => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [schoolSecret, setSchoolSecret] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("선생님 성함을 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    const res = await authEngine.loginTeacher(name, password);
    setIsLoading(false);

    if (res.success && res.session) {
      onSuccess(res.session);
    } else {
      setError(res.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("선생님 성함을 입력해주세요.");
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      setError("비밀번호는 4자리 이상이어야 합니다.");
      return;
    }
    if (!schoolSecret.trim()) {
      setError("학교 교사 인증키를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    const res = await authEngine.registerTeacher(name, password, schoolSecret);
    setIsLoading(false);

    if (res.success && res.teacher) {
      const session = authEngine.createTeacherSession(res.teacher);
      onSuccess(session);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>선생님 인증 & 로그인</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 전환 (로그인 / 새 계정 생성) */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              tab === "login"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>선생님 로그인</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              tab === "register"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>새 계정 생성</span>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start space-x-1.5 font-medium leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                선생님 성함
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김수학"
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                선생님 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>{isLoading ? "확인 중..." : "선생님 로그인"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                선생님 성함
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 강수학"
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                사용할 비밀번호 (4자리 이상)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>학교 교사 인증키</span>
                <span className="text-[10px] text-blue-600 font-normal">교무실 전용 비밀키</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={schoolSecret}
                  onChange={(e) => setSchoolSecret(e.target.value)}
                  placeholder="학교 교사 인증키 입력"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                * 학생의 교사 사칭을 방지하기 위한 학교 교원 전용 인증키입니다.
              </p>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>{isLoading ? "등록 중..." : "교사 등록 완료"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
