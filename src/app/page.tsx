"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { StudentLogin } from "@/components/student/StudentLogin";
import { ReflectionForm } from "@/components/student/ReflectionForm";
import { MyJournalList } from "@/components/student/MyJournalList";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { ClassSetupModal } from "@/components/teacher/ClassSetupModal";
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

  // 모달 제어
  const [isClassSetupOpen, setIsClassSetupOpen] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    const loadedClasses = journalStore.getClasses();
    setClasses(loadedClasses);
    if (loadedClasses.length > 0) {
      setActiveClass(loadedClasses[0]);
    }
    const loadedEntries = journalStore.getAllEntries();
    setEntries(loadedEntries);

    const existingSession = authEngine.getCurrentSession();
    if (existingSession) {
      setSession(existingSession);
      setCurrentRole(existingSession.role);
    }
  }, []);

  // 학생 로그인 핸들러
  const handleStudentLogin = (
    studentNumber: string,
    pin: string,
    name: string,
    classCode: string
  ) => {
    const foundClass = journalStore.findClassByCode(classCode);
    if (!foundClass) {
      alert(`입력하신 수업코드 [${classCode}]를 찾을 수 없습니다. 선생님께 코드를 확인해주세요.`);
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
  };

  // 학생 성찰 일기 제출 핸들러
  const handleSaveReflection = (answers: ReflectionAnswers) => {
    if (!activeClass || !session) return;

    const newEntry: ReflectionEntry = {
      id: `ent_${Date.now()}`,
      classId: activeClass.id,
      className: activeClass.name,
      subject: activeClass.subject,
      teacherName: activeClass.teacherName,
      studentId: session.userId,
      studentNumber: session.studentNumber || "20315",
      studentName: session.name,
      date: new Date().toISOString().split("T")[0],
      chapter: activeClass.activeChapter,
      answers,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    journalStore.saveEntry(newEntry);
    setEntries(journalStore.getAllEntries());
  };

  // 새 수업 개설 핸들러
  const handleSaveClass = (newClass: ClassSession) => {
    journalStore.addClass(newClass);
    const updated = journalStore.getClasses();
    setClasses(updated);
    setActiveClass(newClass);
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
        onSelectRole={(role) => {
          setCurrentRole(role);
          if (role === "teacher" && (!session || session.role !== "teacher")) {
            const tch = authEngine.loginAsTeacher("박수학 선생님");
            setSession(tch);
          }
        }}
        onLogout={handleLogout}
        onOpenClassSetup={() => setIsClassSetupOpen(true)}
      />

      {/* 메인 뷰 전환 */}
      <main className="flex-1">
        {/* 1. 학생 일기장 모드 */}
        {currentRole === "student" && (
          <div className="py-4 px-4 sm:px-6">
            {!session || session.role !== "student" ? (
              <StudentLogin
                onLogin={handleStudentLogin}
                defaultClassCode={activeClass?.code || "MTH-203"}
              />
            ) : (
              <div>
                {activeClass && (
                  <ReflectionForm
                    currentClass={activeClass}
                    studentNumber={session.studentNumber || ""}
                    studentName={session.name}
                    onSubmit={handleSaveReflection}
                  />
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
        {currentRole === "teacher" && activeClass && (
          <TeacherDashboard
            currentClass={activeClass}
            allClasses={classes}
            entries={currentClassEntries}
            onSelectClass={(cls) => setActiveClass(cls)}
            onOpenClassSetup={() => setIsClassSetupOpen(true)}
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
        teacherName={session?.name || "박수학 선생님"}
      />
    </div>
  );
}
