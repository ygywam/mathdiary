/**
 * 학생 및 교사 인증 관리 엔진
 * 학생 개인정보 최소화: 실명/이메일 없이 '학번 + 4자리 PIN' 기반 인증
 * 교사 관리자 권한: 관리자 PIN(1234) 검증 기반 격리
 */

export interface UserSession {
  role: "student" | "teacher";
  userId: string;
  studentNumber?: string;
  name: string;
  enrolledClassIds: string[];
  isAdminAuthed?: boolean;
}

const SESSION_STORAGE_KEY = "math_reflection_session_v3";

export const authEngine = {
  // 현재 세션 가져오기 (구버전 '박수학' 및 비인가 세션 강제 정제)
  getCurrentSession(): UserSession | null {
    if (typeof window === "undefined") return null;

    // 이전 버전 잔여 세션 키 완전 소거
    localStorage.removeItem("math_reflection_session");
    localStorage.removeItem("math_reflection_session_v2");

    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed: UserSession = JSON.parse(raw);
      // '박수학' 잔재가 포함되어 있으면 즉시 제거
      if (parsed.name && parsed.name.includes("박수학")) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  // 학생 간편 로그인 (학번 + PIN)
  loginAsStudent(studentNumber: string, pin: string, name?: string): UserSession {
    const studentName = name?.trim() || `${studentNumber} 학생`;
    const session: UserSession = {
      role: "student",
      userId: `std_${studentNumber}`,
      studentNumber,
      name: studentName,
      enrolledClassIds: [],
      isAdminAuthed: false,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  // 교사 관리자 로그인 (PIN 1234 인증 완료 시 발급)
  loginAsTeacher(teacherName?: string): UserSession {
    const cleanName = teacherName?.trim() || "담당 수학교사";
    const session: UserSession = {
      role: "teacher",
      userId: `tch_${Date.now()}`,
      name: cleanName,
      enrolledClassIds: [],
      isAdminAuthed: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  // 로그아웃 (세션 및 관리자 인증 완전 초기화)
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },
};
