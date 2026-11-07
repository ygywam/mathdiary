"use client";

import React, { useState } from "react";
import { Settings, Lock, User, X, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { authEngine } from "@/engine/auth";
import { journalStore, ClassSession } from "@/store/useJournalStore";
import { supabase, isSupabaseConfigured } from "@/engine/supabaseClient";

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
  const [teacherName, setTeacherName] = useState(authEngine.getTeacherName());
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");

  const [nameSuccess, setNameSuccess] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  // 1. 교사 이름 저장 및 현재 수업 동기화
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      alert("교사명을 입력해주세요.");
      return;
    }
    const clean = teacherName.trim();
    authEngine.saveTeacherName(clean);

    // 현재 수업 및 기존 수업의 교사명 일괄 갱신
    const allClasses = journalStore.getClasses();
    const updated = allClasses.map((c) => ({
      ...c,
      teacherName: clean,
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem("math_reflection_classes_v2", JSON.stringify(updated));
    }

    // Supabase DB 클라우드 UPDATE
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("classes").update({ teacher: clean }).neq("teacher", clean);
      } catch (err) {
        console.warn("Cloud teacher name update error:", err);
      }
    }

    setNameSuccess(true);
    setTimeout(() => setNameSuccess(false), 2500);
    onClassUpdated();
  };

  // 2. 관리자 비밀번호 PIN 변경
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== newPinConfirm) {
      setPinMessage({ type: "error", text: "새 비밀번호 확인이 일치하지 않습니다." });
      return;
    }
    const res = authEngine.changeAdminPin(currentPin, newPin);
    if (res.success) {
      setPinMessage({ type: "success", text: res.message });
      setCurrentPin("");
      setNewPin("");
      setNewPinConfirm("");
      setTimeout(() => setPinMessage(null), 3000);
    } else {
      setPinMessage({ type: "error", text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 font-bold text-base text-slate-900">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>교사 환경설정</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. 교사 이름 설정 */}
        <form onSubmit={handleSaveName} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>담당 교사명 수정</span>
            </label>
            {nameSuccess && (
              <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>저장 완료</span>
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="예: 홍길동 선생님"
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              저장
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            * 변경 시 현재 개설된 수업의 담당 교사명이 함께 갱신됩니다.
          </p>
        </form>

        {/* 2. 관리자 비밀번호 변경 */}
        <form onSubmit={handleChangePin} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>교사 관리자 비밀번호 변경</span>
          </label>

          {pinMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 border ${
                pinMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {pinMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{pinMessage.text}</span>
            </div>
          )}

          <div className="space-y-2">
            <input
              type="password"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="현재 비밀번호"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="새 비밀번호 (4자리 이상)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
              <input
                type="password"
                value={newPinConfirm}
                onChange={(e) => setNewPinConfirm(e.target.value)}
                placeholder="새 비밀번호 확인"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              비밀번호 변경
            </button>
          </div>
        </form>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
