"use client";

import React from "react";
import { BookOpen, User, GraduationCap, LogOut, Lightbulb } from "lucide-react";
import { UserSession } from "@/engine/auth";

interface HeaderProps {
  currentRole: "student" | "teacher" | "print";
  session: UserSession | null;
  onSelectRole: (role: "student" | "teacher" | "print") => void;
  onLogout: () => void;
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  session,
  onSelectRole,
  onLogout,
  onOpenTour,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 서비스 로고 및 이름 */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onSelectRole("student")}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
              수학 수업 성찰 일기
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              배움과 성장을 기록하는 매일 5분 피드백
            </p>
          </div>
        </div>

        {/* 중앙 모드 전환 탭 */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onSelectRole("student")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentRole === "student"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>학생 일기장</span>
          </button>

          <button
            onClick={() => onSelectRole("teacher")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              currentRole === "teacher"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>교사 대시보드</span>
          </button>
        </nav>

        {/* 우측 사용법 버튼 & 세션 정보 */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* 사용법 버튼 */}
          <button
            type="button"
            onClick={onOpenTour}
            className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors shadow-xs"
            title="사용 방법 가이드 열기"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>사용법</span>
          </button>

          {session ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                {session.role === "teacher" ? "👨‍🏫" : "🧑‍🎓"} {session.name}
              </span>
              <button
                onClick={onLogout}
                title="로그아웃"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              로그인 필요
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
