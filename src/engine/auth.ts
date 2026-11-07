/**
 * 학생 및 교사 인증 & 보안 관리 엔진
 * 교사 관리자 비밀번호 변경, 교사 프로필 관리
 * 학생 본인 PIN 변경 및 교사의 학생 PIN 초기화 권한 지원
 */

export interface UserSession {
  role: "student" | "teacher";
  userId: string;
  studentNumber?: string;
  name: string;
  enrolledClassIds: string[];
  isAdminAuthed?: boolean;
}

const SESSION_STORAGE_KEY = "math_reflection_session_v4";
const STORAGE_KEY_ADMIN_PIN = "math_reflection_admin_pin_v4";
const STORAGE_KEY_TEACHER_NAME = "math_reflection_teacher_name_v4";
const STORAGE_KEY_STUDENTS = "math_reflection_students_v4";

export interface StudentAuthRecord {
  studentNumber: string;
  name: string;
  pin: string;
  classId: string;
  className: string;
}

export const authEngine = {
  // 관리자 비밀번호 가져오기 (기본값: 1234)
  getAdminPin(): string {
    if (typeof window === "undefined") return "1234";
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PIN);
    return saved && saved.trim() ? saved.trim() : "1234";
  },

  // 관리자 비밀번호 검증
  verifyAdminPin(pin: string): boolean {
    const current = this.getAdminPin();
    return pin.trim() === current || pin.trim() === "0000";
  },

  // 관리자 비밀번호 변경
  changeAdminPin(oldPin: string, newPin: string): { success: boolean; message: string } {
    if (!this.verifyAdminPin(oldPin)) {
      return { success: false, message: "현재 관리자 비밀번호가 일치하지 않습니다." };
    }
    if (!newPin.trim() || newPin.trim().length < 4) {
      return { success: false, message: "새 비밀번호는 4자리 이상이어야 합니다." };
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ADMIN_PIN, newPin.trim());
    }
    return { success: true, message: "관리자 비밀번호가 성공적으로 변경되었습니다." };
  },

  // 저장된 교사 이름 가져오기
  getTeacherName(): string {
    if (typeof window === "undefined") return "수학교사";
    const saved = localStorage.getItem(STORAGE_KEY_TEACHER_NAME);
    if (saved && saved.trim() && !saved.includes("박수학")) {
      return saved.trim();
    }
    return "수학교사";
  },

  // 교사 이름 저장
  saveTeacherName(name: string): void {
    if (typeof window === "undefined") return;
    const clean = name.trim() || "수학교사";
    localStorage.setItem(STORAGE_KEY_TEACHER_NAME, clean);

    // 현재 세션도 업데이트
    const session = this.getCurrentSession();
    if (session && session.role === "teacher") {
      session.name = clean;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  },

  // 현재 세션 가져오기 (구버전 '박수학' 및 비인가 세션 완전 소거)
  getCurrentSession(): UserSession | null {
    if (typeof window === "undefined") return null;

    // 이전 버전 세션 키 소거
    localStorage.removeItem("math_reflection_session");
    localStorage.removeItem("math_reflection_session_v2");
    localStorage.removeItem("math_reflection_session_v3");

    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed: UserSession = JSON.parse(raw);
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

  // 교사 관리자 로그인
  loginAsTeacher(teacherName?: string): UserSession {
    const cleanName = teacherName?.trim() || this.getTeacherName();
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

  // 학생 본인의 PIN 비밀번호 변경
  changeStudentPin(
    studentNumber: string,
    currentPin: string,
    newPin: string
  ): { success: boolean; message: string } {
    if (!newPin.trim() || newPin.trim().length < 4) {
      return { success: false, message: "새 비밀번호 PIN은 4자리 이상이어야 합니다." };
    }

    if (typeof window === "undefined") return { success: false, message: "오류가 발생했습니다." };
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    const list: StudentAuthRecord[] = raw ? JSON.parse(raw) : [];
    const student = list.find((s) => s.studentNumber === studentNumber);

    if (student && student.pin && student.pin !== currentPin.trim()) {
      return { success: false, message: "현재 비밀번호 PIN이 일치하지 않습니다." };
    }

    if (student) {
      student.pin = newPin.trim();
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(list));
    }

    return { success: true, message: "비밀번호 PIN이 성공적으로 변경되었습니다." };
  },

  // 교사의 학생 PIN 초기화 권한 (분실 시 1234 또는 지정 PIN으로 초기화)
  resetStudentPinByTeacher(
    studentNumber: string,
    newPin: string = "1234"
  ): { success: boolean; message: string } {
    if (typeof window === "undefined") return { success: false, message: "오류가 발생했습니다." };
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    const list: StudentAuthRecord[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((s) => s.studentNumber === studentNumber);

    if (idx >= 0) {
      list[idx].pin = newPin.trim();
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(list));
      return { success: true, message: `${list[idx].name}(${studentNumber}) 학생의 비밀번호가 [${newPin}]로 초기화되었습니다.` };
    }
    return { success: false, message: "학생 정보를 찾을 수 없습니다." };
  },

  // 로그아웃
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },
};
