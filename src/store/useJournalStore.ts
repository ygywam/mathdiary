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

// 초기 시뮬레이션용 시드 데이터
const INITIAL_CLASSES: ClassSession[] = [
  {
    id: "cls_sample_01",
    teacherId: "tch_sample",
    teacherName: "박수학 선생님",
    name: "고1-3반 수학",
    code: "MTH-203",
    grade: "고등학교",
    subject: "공통수학1",
    activeChapter: {
      major: "Ⅱ. 방정식과 부등식",
      minor: "1. 복소수와 이차방정식",
      topic: "이차방정식의 판별식 D와 실근·허근",
    },
    createdAt: "2026-11-01",
  },
];

const INITIAL_ENTRIES: ReflectionEntry[] = [
  {
    id: "ent_01",
    classId: "cls_sample_01",
    className: "고1-3반 수학",
    subject: "공통수학1",
    teacherName: "박수학 선생님",
    studentId: "std_20315",
    studentNumber: "20315",
    studentName: "김민준",
    date: "2026-11-04",
    chapter: {
      major: "Ⅱ. 방정식과 부등식",
      minor: "1. 복소수와 이차방정식",
      topic: "이차방정식의 판별식 D와 실근·허근",
    },
    answers: {
      concept: "이차방정식 ax²+bx+c=0에서 근의 개수를 조사하는 판별식 D=b²-4ac를 배웠습니다.",
      explained: "판별식 D가 0보다 크면 서로 다른 두 실근, 0이면 중근, 0보다 작으면 서로 다른 두 허근을 갖는다는 뜻입니다.",
      discovered: "계수 a, b, c가 반드시 실수일 때만 판별식으로 실근·허근을 따질 수 있다는 점을 새롭게 알았습니다.",
      plan: "교과서 78쪽 예제 3번과 판별식 활용 문제를 스스로 다시 풀어보겠습니다.",
    },
    createdAt: "2026-11-04 15:45",
  },
  {
    id: "ent_02",
    classId: "cls_sample_01",
    className: "고1-3반 수학",
    subject: "공통수학1",
    teacherName: "박수학 선생님",
    studentId: "std_20308",
    studentNumber: "20308",
    studentName: "이서연",
    date: "2026-11-04",
    chapter: {
      major: "Ⅱ. 방정식과 부등식",
      minor: "1. 복소수와 이차방정식",
      topic: "이차방정식의 판별식 D와 실근·허근",
    },
    answers: {
      concept: "짝수 공식 판별식 D/4 = b'²-ac 공식과 그 증명 과정.",
      explained: "x의 계수가 짝수일 때는 b를 2로 나눈 b'을 제곱하고 ac를 빼주면 숫자가 훨씬 작아져서 계산 실수가 줄어듭니다.",
      discovered: "중근도 '실근'에 포함되기 때문에 '실근을 가질 조건'은 D≥0이어야 한다는 점을 헷갈렸다가 바로잡았습니다.",
      plan: "중근 조건 문제와 오답노트에 적힌 문제 2개를 복습하겠습니다.",
    },
    createdAt: "2026-11-04 15:47",
  },
  {
    id: "ent_03",
    classId: "cls_sample_01",
    className: "고1-3반 수학",
    subject: "공통수학1",
    teacherName: "박수학 선생님",
    studentId: "std_20321",
    studentNumber: "20321",
    studentName: "박도현",
    date: "2026-11-04",
    chapter: {
      major: "Ⅱ. 방정식과 부등식",
      minor: "1. 복소수와 이차방정식",
      topic: "이차방정식의 판별식 D와 실근·허근",
    },
    answers: {
      concept: "근호 안의 식이 판별식 D라는 점과 근의 공식의 구조적 원리.",
      explained: "루트 안이 양수면 숫자가 2개 생기고, 0이면 ±0이라서 1개만 남고, 음수면 허수 i가 나와서 허근이 됩니다.",
      discovered: "허근을 가질 때 두 허근은 항상 서로 켤레복소수 관계라는 점이 신기했습니다.",
      plan: "오늘 배운 판별식 D 공식을 깜지 안 보고 빈 종이에 적어보고 확인하겠습니다.",
    },
    createdAt: "2026-11-04 15:49",
  },
];

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
