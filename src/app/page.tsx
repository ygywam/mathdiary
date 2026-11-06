"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/common/Header";
import { StudentLogin } from "@/components/student/StudentLogin";
import { ReflectionForm } from "@/components/student/ReflectionForm";
import { MyJournalList } from "@/components/student/MyJournalList";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { ClassSetupModal } from "@/components/teacher/ClassSetupModal";
import { TeacherAuthModal } from "@/components/teacher/TeacherAuthModal";
import { RosterUploadModal } from "@/components/teacher/RosterUploadModal";
import { TourGuide } from "@/components/common/TourGuide";
import { A5PrintLayout } from "@/components/print/A5PrintLayout";
import {
  journalStore,
  ClassSession,
  ReflectionEntry,
  ReflectionAnswers,
} from "@/store/useJournalStore";
import { authEngine, UserSession } from "@/engine/auth";

export default function Home() {
  const [currentRole, setCurrentRole] = useState<"student" | "teacher" | "print">("student");
  const [session, setSession] = useState<UserSession | null>(null);

  // 스토어 상태
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [activeClass, setActiveClass] = useState<ClassSession | null>(null);
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);

  // 모달 제어 상태
  const [isClassSetupOpen, setIsClassSetupOpen] = useState(false);
  const [isTeacherAuthOpen, setIsTeacherAuthOpen] = useState(false);
  const [isRosterUploadOpen, setIsRosterUploadOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // 데이터 동기화 함수
  const refreshData = useCallback(async () => {
    // 1. 로컬 캐시 즉시 반영
    const localClasses = journalStore.getClasses();
    setClasses(localClasses);
    if (localClasses.length > 0 && !activeClass) {
      setActiveClass(localClasses[0]);
    }
    const localEntries = journalStore.getAllEntries();
    setEntries(localEntries);

    // 2. 수파베이스(Supabase) 클라우드 동기화
    try {
      const cloudClasses = await journalStore.fetchClassesFromCloud();
      setClasses(cloudClasses);
      if (cloudClasses.length > 0) {
        setActiveClass((prev) => prev || cloudClasses[0]);
      }

      const cloudEntries = await journalStore.fetchEntriesFromCloud();
      setEntries(cloudEntries);
    } catch (e) {
      console.warn("Cloud data refresh failed, using local storage:", e);
    }
  }, [activeClass]);

  // 초기 마운트 시 데이터 로딩 및 기존 세션 복원
  useEffect(() => {
    refreshData();

    const existingSession = authEngine.getCurrentSession();
    if (existingSession) {
      setSession(existingSession);
      if (existingSession.role === "teacher") {
        setCurrentRole("teacher");
      }
    }
  }, [refreshData]);

  // 역할 전환 핸들러 (교사 대시보드 진입 시 관리자 인증 검증)
  const handleSelectRole = (role: "student" | "teacher" | "print") => {
    if (role === "teacher") {
      if (session && session.role === "teacher") {
        setCurrentRole("teacher");
      } else {
        setIsTeacherAuthOpen(true);
      }
    } else {
      setCurrentRole(role);
    }
  };

  // 교사 관리자 인증 성공 핸들러
  const handleTeacherAuthSuccess = () => {
    const teacherSession = authEngine.loginAsTeacher("수학교사");
    setSession(teacherSession);
    setCurrentRole("teacher");
    setIsTeacherAuthOpen(false);
  };

  // 학생 로그인 핸들러
  const handleStudentLogin = (
    studentNumber: string,
    pin: string,
    name: string,
    classCode: string
  ) => {
    const foundClass = journalStore.findClassByCode(classCode);
    if (!foundClass) {
      alert(`입력하신 수업코드 [${classCode}]를 찾을 수 없습니다. 선생님께 수업코드를 확인해주세요.`);
      return;
    }

    const newSession = authEngine.loginAsStudent(studentNumber, pin, name);
    newSession.enrolledClassIds = [foundClass.id];
    setSession(newSession);
    setActiveClass(foundClass);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    authEngine.logout();
    setSession(null);
    setCurrentRole("student");
  };

  // 학생 성찰 일기 제출 핸들러
  const handleSaveReflection = async (answers: ReflectionAnswers) => {
    if (!activeClass || !session) return;

    const newEntry: ReflectionEntry = {
      id: `ent_${Date.now()}`,
      classId: activeClass.id,
      className: activeClass.name,
      subject: activeClass.subject,
      teacherName: activeClass.teacherName,
      studentId: session.userId,
      studentNumber: session.studentNumber || "학번미입력",
      studentName: session.name,
      date: new Date().toISOString().split("T")[0],
      chapter: activeClass.activeChapter,
      answers,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    await journalStore.saveEntry(newEntry);
    setEntries(journalStore.getAllEntries());
  };

  // 새 수업 개설 핸들러
  const handleSaveClass = async (newClass: ClassSession) => {
    await journalStore.addClass(newClass);
    const updated = journalStore.getClasses();
    setClasses(updated);
    setActiveClass(newClass);
    setIsClassSetupOpen(false);
  };

  // 학생 본인 전용 일기 목록 (RLS 격리)
  const studentEntries = session ? journalStore.getStudentEntries(session.userId) : [];

  // 교사용 현재 수업 일기 목록
  const currentClassEntries = activeClass
    ? journalStore.getClassEntries(activeClass.id)
    : entries;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 상단 공통 헤더 */}
      <Header
        currentRole={currentRole}
        session={session}
        onSelectRole={handleSelectRole}
        onLogout={handleLogout}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* 메인 뷰 전환 */}
      <main className="flex-1">
        {/* 1. 학생 일기장 모드 */}
        {currentRole === "student" && (
          <div className="py-4 px-4 sm:px-6">
            {!session || session.role !== "student" ? (
              <StudentLogin
                onLogin={handleStudentLogin}
                defaultClassCode={activeClass?.code || ""}
              />
            ) : (
              <div>
                {activeClass ? (
                  <ReflectionForm
                    currentClass={activeClass}
                    studentNumber={session.studentNumber || ""}
                    studentName={session.name}
                    onSubmit={handleSaveReflection}
                  />
                ) : (
                  <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-700">참여 중인 수업이 없습니다</p>
                    <p className="text-xs text-slate-500 mt-1">선생님께 수업코드를 받아 다시 로그인해주세요.</p>
                  </div>
                )}
                <MyJournalList
                  entries={studentEntries}
                  studentName={session.name}
                />
              </div>
            )}
          </div>
        )}

        {/* 2. 교사 대시보드 모드 */}
        {currentRole === "teacher" && (
          <TeacherDashboard
            currentClass={activeClass}
            allClasses={classes}
            entries={currentClassEntries}
            onSelectClass={(cls) => setActiveClass(cls)}
            onOpenClassSetup={() => setIsClassSetupOpen(true)}
            onOpenRosterUpload={() => setIsRosterUploadOpen(true)}
            onGoToPrint={() => setCurrentRole("print")}
          />
        )}

        {/* 3. A4 가로 2쪽(A5×2) 인쇄 모드 */}
        {currentRole === "print" && activeClass && (
          <A5PrintLayout
            entries={currentClassEntries}
            currentClass={activeClass}
            onBack={() => setCurrentRole("teacher")}
          />
        )}
      </main>

      {/* 수업 개설 모달 */}
      <ClassSetupModal
        isOpen={isClassSetupOpen}
        onClose={() => setIsClassSetupOpen(false)}
        onSaveClass={handleSaveClass}
        teacherName={session?.name || "수학교사"}
      />

      {/* 교사 관리자 인증 모달 */}
      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => setIsTeacherAuthOpen(false)}
        onSuccess={handleTeacherAuthSuccess}
      />

      {/* 엑셀 명렬표 등록 모달 */}
      <RosterUploadModal
        isOpen={isRosterUploadOpen}
        onClose={() => setIsRosterUploadOpen(false)}
        currentClass={activeClass}
        onSuccess={refreshData}
      />

      {/* 사용법 가이드 투어 모달 */}
      <TourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}
