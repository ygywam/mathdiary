/**
 * 성찰 일기 스토어 및 데이터 계층 (RLS 격리 원칙 적용)
 * LocalStorage를 이용해 오프라인 브라우저에서도 영구 보존되며
 * 학생은 본인의 글만, 교사는 해당 수업의 전체 글만 열람 가능하도록 데이터 격리
 */

export interface ChapterInfo {
  major: string;
  minor: string;
  topic: string;
}

export interface ClassSession {
  id: string;
  teacherId: string;
  teacherName: string;
  name: string;             // 예: 2학년 3반 수학
  code: string;             // 고정 수업코드 (예: MTH-203)
  grade: string;            // 고등학교
  subject: string;          // 공통수학1
  activeChapter: ChapterInfo;
  createdAt: string;
}

export interface ReflectionAnswers {
  concept: string;          // 1. 배운 핵심 개념
  explained: string;        // 2. 친구에게 설명하기
  discovered: string;       // 3. 새롭게 알게 된 점 / 오개념
  plan: string;             // 4. 앞으로의 계획
}

export interface ReflectionEntry {
  id: string;
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  studentId: string;
  studentNumber: string;    // 예: 20315
  studentName: string;      // 예: 김수학
  date: string;             // YYYY-MM-DD
  chapter: ChapterInfo;
  answers: ReflectionAnswers;
  createdAt: string;
}

const STORAGE_KEY_CLASSES = "math_reflection_classes_v1";
const STORAGE_KEY_ENTRIES = "math_reflection_entries_v1";

// 초기 시뮬레이션용 데이터 (더미데이터 완전 제거: 빈 배열)
const INITIAL_CLASSES: ClassSession[] = [];
const INITIAL_ENTRIES: ReflectionEntry[] = [];

export const journalStore = {
  // 전체 수업 목록 로드
  getClasses(): ClassSession[] {
    if (typeof window === "undefined") return INITIAL_CLASSES;
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(INITIAL_CLASSES));
      return INITIAL_CLASSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLASSES;
    }
  },

  // 수업 신규 개설
  addClass(newClass: ClassSession): void {
    const list = this.getClasses();
    const updated = [newClass, ...list];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(updated));
    }
  },

  // 수업코드(예: MTH-203)로 수업 찾기
  findClassByCode(code: string): ClassSession | undefined {
    const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
    return this.getClasses().find(
      (c) => c.code.replace(/\s+/g, "").toUpperCase() === normalized
    );
  },

  // 당일 활성 단원 변경
  updateClassActiveChapter(classId: string, chapter: ChapterInfo): void {
    const list = this.getClasses().map((c) =>
      c.id === classId ? { ...c, activeChapter: chapter } : c
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(list));
    }
  },

  // 전체 일기 레코드 로드
  getAllEntries(): ReflectionEntry[] {
    if (typeof window === "undefined") return INITIAL_ENTRIES;
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ENTRIES;
    }
  },

  // [학생 RLS 격리]: 학생 본인 글만 조회
  getStudentEntries(studentId: string): ReflectionEntry[] {
    return this.getAllEntries().filter((e) => e.studentId === studentId);
  },

  // [교사 RLS 격리]: 특정 수업에 제출된 일기 전체 조회
  getClassEntries(classId: string): ReflectionEntry[] {
    return this.getAllEntries().filter((e) => e.classId === classId);
  },

  // 성찰 일기 신규 저장
  saveEntry(entry: ReflectionEntry): void {
    const list = this.getAllEntries();
    // 동일 일자, 동일 학생, 동일 수업 중복 제출 시 업데이트 또는 추가
    const existingIndex = list.findIndex(
      (e) =>
        e.classId === entry.classId &&
        e.studentId === entry.studentId &&
        e.date === entry.date
    );

    let updated: ReflectionEntry[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...list];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
    }
  },
};
