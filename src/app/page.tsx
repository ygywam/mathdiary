"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/common/Header";
import { FullscreenIntro } from "@/components/common/FullscreenIntro";
import { StudentLogin } from "@/components/student/StudentLogin";
import { ReflectionForm } from "@/components/student/ReflectionForm";
import { MyJournalList } from "@/components/student/MyJournalList";
import { StudentPasswordModal } from "@/components/student/StudentPasswordModal";
import { ClassSelectionModal } from "@/components/student/ClassSelectionModal";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { ClassSetupModal } from "@/components/teacher/ClassSetupModal";
import { ChapterSelectModal } from "@/components/teacher/ChapterSelectModal";
import { TeacherAuthModal } from "@/components/teacher/TeacherAuthModal";
import { TeacherSettingsModal } from "@/components/teacher/TeacherSettingsModal";
import { StudentManagementModal } from "@/components/teacher/StudentManagementModal";
import { RosterUploadModal } from "@/components/teacher/RosterUploadModal";
import { AIAssistantModal } from "@/components/teacher/AIAssistantModal";
import { TourGuide, TourContext } from "@/components/common/TourGuide";
import { A5PrintLayout } from "@/components/print/A5PrintLayout";
import {
  journalStore,
  ClassSession,
  ReflectionEntry,
  ReflectionAnswers,
  ChapterInfo,
} from "@/store/useJournalStore";
import { authEngine, UserSession, StudentEnrollment } from "@/engine/auth";

export default function Home() {
  const [currentRole, setCurrentRole] = useState<"student" | "teacher" | "print">("student");
  const [session, setSession] = useState<UserSession | null>(null);

  // 스토어 상태
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [activeClass, setActiveClass] = useState<ClassSession | null>(null);
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);

  // 풀스크린 인트로 상태
  const [showIntro, setShowIntro] = useState(false);

  // 다중 수업 선택 모달 상태 (고교학점제)
  const [isClassSelectionOpen, setIsClassSelectionOpen] = useState(false);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);

  // 모달 제어 상태
  const [isClassSetupOpen, setIsClassSetupOpen] = useState(false);
  const [isTeacherAuthOpen, setIsTeacherAuthOpen] = useState(false);
  const [isTeacherSettingsOpen, setIsTeacherSettingsOpen] = useState(false);
  const [isStudentManagementOpen, setIsStudentManagementOpen] = useState(false);
  const [isStudentPasswordOpen, setIsStudentPasswordOpen] = useState(false);
  const [isRosterUploadOpen, setIsRosterUploadOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isChapterSelectOpen, setIsChapterSelectOpen] = useState(false);
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

  // 초기 마운트 시 풀스크린 인트로 체크 및 세션 복원
  useEffect(() => {
    refreshData();

    // 풀스크린 인트로 '다시 보지 않기' 확인
    const dismissed = localStorage.getItem("math_reflection_intro_dismissed_v1");
    if (!dismissed) {
      setShowIntro(true);
    }

    const existingSession = authEngine.getCurrentSession();
    if (existingSession) {
      setSession(existingSession);
      if (existingSession.role === "student") {
        setCurrentRole("student");
        // 학생이 참여한 수업 자동 매칭
        const enrollments = authEngine.getStudentEnrollments(existingSession.studentNumber || "");
        if (enrollments.length > 0) {
          const found = journalStore.getClasses().find((c) => c.id === enrollments[0].classId);
          if (found) setActiveClass(found);
        }
      } else if (existingSession.role === "teacher") {
        setCurrentRole("teacher");
      }
    }
  }, [refreshData]);

  // 역할 전환 핸들러 (교사 대시보드 진입 시 교사 로그인 검증)
  const handleSelectRole = (role: "student" | "teacher" | "print") => {
    if (role === "teacher") {
      if (session && session.role === "teacher" && session.isAdminAuthed) {
        setCurrentRole("teacher");
      } else {
        setIsTeacherAuthOpen(true);
      }
    } else {
      setCurrentRole(role);
    }
  };

  // 교사 로그인 성공 핸들러
  const handleTeacherAuthSuccess = (teacherSession: UserSession) => {
    setSession(teacherSession);
    setCurrentRole("teacher");
    setIsTeacherAuthOpen(false);

    // 해당 교사의 수업 목록으로 activeClass 자동 설정
    const teacherClasses = journalStore.getClassesByTeacher(
      teacherSession.userId,
      teacherSession.name
    );
    if (teacherClasses.length > 0) {
      setActiveClass(teacherClasses[0]);
    } else {
      setActiveClass(null);
    }
  };

  // 새 수업 개설 열기 핸들러
  const handleOpenClassSetup = () => {
    if (!session || session.role !== "teacher" || !session.isAdminAuthed) {
      setIsTeacherAuthOpen(true);
      return;
    }
    setIsClassSetupOpen(true);
  };

  // 학생 학번+PIN 간편 로그인 핸들러 (수업코드 불필요)
  const handleStudentLogin = (studentNumber: string, pin: string) => {
    const res = authEngine.loginStudentByNumber(studentNumber, pin);
    if (!res.success) {
      alert(res.message);
      return;
    }

    setSession(res.session || null);
    const enrollments = res.enrollments || [];
    setStudentEnrollments(enrollments);

    const allClasses = journalStore.getClasses();

    if (enrollments.length === 1) {
      // 1개 수업만 수강 중: 즉시 해당 수업으로 직행!
      const targetClass = allClasses.find((c) => c.id === enrollments[0].classId);
      if (targetClass) {
        setActiveClass(targetClass);
      } else if (allClasses.length > 0) {
        setActiveClass(allClasses[0]);
      }
    } else if (enrollments.length > 1) {
      // 2개 이상의 수업 수강 중 (고교학점제): 수업 선택 모달 오픈
      setIsClassSelectionOpen(true);
    } else {
      // 아직 수업에 등록되지 않은 경우: 첫 번째 수업 또는 임시 연결
      if (allClasses.length > 0) {
        setActiveClass(allClasses[0]);
      }
    }
  };

  // 다중 수업 중 하나 선택 시
  const handleSelectStudentClass = (classId: string) => {
    const allClasses = journalStore.getClasses();
    const found = allClasses.find((c) => c.id === classId);
    if (found) {
      setActiveClass(found);
    }
    setIsClassSelectionOpen(false);
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

  // 새 수업 개설 핸들러 (현재 로그인한 교사 ID/이름 귀속)
  const handleSaveClass = async (newClass: ClassSession) => {
    const classWithTeacher: ClassSession = {
      ...newClass,
      teacherId: session?.userId || "tch_default",
      teacherName: session?.name || "선생님",
    };
    await journalStore.addClass(classWithTeacher);
    const updated = journalStore.getClasses();
    setClasses(updated);
    setActiveClass(classWithTeacher);
    setIsClassSetupOpen(false);
  };

  // 오늘 진도 단원 1클릭 변경 핸들러
  const handleUpdateChapter = async (newChapter: ChapterInfo) => {
    if (!activeClass) return;
    await journalStore.updateClassActiveChapter(activeClass.id, newChapter);
    setActiveClass((prev) => (prev ? { ...prev, activeChapter: newChapter } : null));
    refreshData();
  };

  // 현재 화면 컨텍스트 (투어 맞춤 가이드용)
  const currentTourContext: TourContext =
    currentRole === "teacher"
      ? "teacher-dashboard"
      : session && session.role === "student"
      ? "student-journal"
      : "student-login";

  // 학생 본인 전용 일기 목록 (RLS 격리)
  const studentEntries = session ? journalStore.getStudentEntries(session.userId) : [];

  // 교사별 수업 목록 격리: 현재 로그인한 교사의 수업만 대시보드에 표시
  const teacherClasses =
    session && session.role === "teacher"
      ? journalStore.getClassesByTeacher(session.userId, session.name)
      : classes;

  // 교사용 현재 수업 일기 목록
  const currentClassEntries = activeClass
    ? journalStore.getClassEntries(activeClass.id)
    : entries;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 0. 풀스크린 인트로 화면 (접속 시 전체 화면 채움) */}
      {showIntro && (
        <FullscreenIntro onStart={() => setShowIntro(false)} />
      )}

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
              <StudentLogin onLogin={handleStudentLogin} />
            ) : (
              <div>
                {/* 다중 수강 학생일 경우 수업 변경 알약 버튼 */}
                {studentEnrollments.length > 1 && (
                  <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs">
                    <span className="font-semibold text-blue-900">
                      현재 수업: <strong>{activeClass?.name}</strong> ({activeClass?.subject})
                    </span>
                    <button
                      onClick={() => setIsClassSelectionOpen(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      다른 수업으로 변경 🔄
                    </button>
                  </div>
                )}

                {activeClass ? (
                  <ReflectionForm
                    currentClass={activeClass}
                    studentNumber={session.studentNumber || ""}
                    studentName={session.name}
                    onSubmit={handleSaveReflection}
                    onOpenPasswordChange={() => setIsStudentPasswordOpen(true)}
                  />
                ) : (
                  <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-700">참여 중인 수학 수업이 없습니다</p>
                    <p className="text-xs text-slate-500 mt-1">선생님께서 학생 명렬표를 등록하시면 자동으로 수업이 표시됩니다.</p>
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

        {/* 2. 교사 대시보드 모드 (교사별 수업/일기 격리) */}
        {currentRole === "teacher" && (
          <TeacherDashboard
            currentClass={activeClass}
            allClasses={teacherClasses}
            entries={currentClassEntries}
            onSelectClass={(cls) => setActiveClass(cls)}
            onOpenClassSetup={handleOpenClassSetup}
            onOpenRosterUpload={() => setIsRosterUploadOpen(true)}
            onOpenSettings={() => setIsTeacherSettingsOpen(true)}
            onOpenStudentManagement={() => setIsStudentManagementOpen(true)}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            onOpenChapterSelect={() => setIsChapterSelectOpen(true)}
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

      {/* 다중 수업 선택 모달 (고교학점제) */}
      <ClassSelectionModal
        isOpen={isClassSelectionOpen}
        studentName={session?.name || ""}
        enrollments={studentEnrollments}
        onSelectClass={handleSelectStudentClass}
        onClose={() => setIsClassSelectionOpen(false)}
      />

      {/* 수업 개설 모달 */}
      <ClassSetupModal
        isOpen={isClassSetupOpen}
        onClose={() => setIsClassSetupOpen(false)}
        onSaveClass={handleSaveClass}
        teacherName={session?.name || "선생님"}
      />

      {/* 교사 계정 로그인 & 생성 모달 (학교 인증키 sflmath 해시 검증) */}
      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => setIsTeacherAuthOpen(false)}
        onSuccess={handleTeacherAuthSuccess}
      />

      {/* 교사 계정 설정 모달 (비밀번호 변경) */}
      <TeacherSettingsModal
        isOpen={isTeacherSettingsOpen}
        onClose={() => setIsTeacherSettingsOpen(false)}
        currentClass={activeClass}
        onClassUpdated={refreshData}
      />

      {/* 학생 명렬 및 PIN 관리 모달 */}
      <StudentManagementModal
        isOpen={isStudentManagementOpen}
        onClose={() => setIsStudentManagementOpen(false)}
        currentClass={activeClass}
      />

      {/* 학생 본인 비밀번호 변경 모달 */}
      {session && (
        <StudentPasswordModal
          isOpen={isStudentPasswordOpen}
          onClose={() => setIsStudentPasswordOpen(false)}
          studentNumber={session.studentNumber || ""}
          studentName={session.name}
        />
      )}

      {/* 엑셀 명렬표 등록 모달 */}
      <RosterUploadModal
        isOpen={isRosterUploadOpen}
        onClose={() => setIsRosterUploadOpen(false)}
        currentClass={activeClass}
        onSuccess={refreshData}
      />

      {/* 수학교과 세특 AI 초안 생성 모달 (Gemini API) */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        currentClass={activeClass}
        entries={currentClassEntries}
      />

      {/* 오늘 진도 단원 1클릭 변경 모달 */}
      {activeClass && (
        <ChapterSelectModal
          isOpen={isChapterSelectOpen}
          onClose={() => setIsChapterSelectOpen(false)}
          currentClass={activeClass}
          onUpdateChapter={handleUpdateChapter}
        />
      )}

      {/* 화면 맞춤형 스포트라이트 포스트잇 가이드 투어 모달 */}
      <TourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        context={currentTourContext}
      />
    </div>
  );
}
