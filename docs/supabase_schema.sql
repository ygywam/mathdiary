-- ==============================================================================
-- 수학 수업 성찰 일기 - Supabase 데이터베이스 테이블 및 보안 정책(RLS) 설정 스크립트
-- Supabase 대시보드 > SQL Editor에 복사하여 붙여넣고 [RUN]을 실행하세요.
-- ==============================================================================

-- 1. 수업 세션 테이블 (classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                  -- 학급/수업 이름 (예: 2학년 3반 수학)
    teacher TEXT NOT NULL,               -- 담당 교사명 (예: 홍길동 선생님)
    subject TEXT NOT NULL,               -- 수학 과목명 (예: 공통수학1, 대수)
    code TEXT NOT NULL UNIQUE,           -- 학기 고정 수업코드 (예: MTH-203)
    active_chapter JSONB DEFAULT '{}'::jsonb, -- 현재 진도 단원 정보
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 학생 명렬표 테이블 (students) - 개인정보 최소화
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number TEXT NOT NULL,        -- 학번 (예: 20315)
    name TEXT NOT NULL,                  -- 학생 이름 또는 닉네임
    pin TEXT NOT NULL,                   -- 4자리 PIN 비밀번호
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_number, class_id)
);

-- 3. 성찰 일기 테이블 (reflection_entries)
CREATE TABLE IF NOT EXISTS public.reflection_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_number TEXT NOT NULL,        -- 작성자 학번
    student_name TEXT NOT NULL,          -- 작성자 이름
    date DATE NOT NULL DEFAULT CURRENT_DATE, -- 수업 일자 (YYYY-MM-DD)
    subject TEXT NOT NULL,               -- 과목명
    teacher TEXT NOT NULL,               -- 교사명
    class_name TEXT NOT NULL,            -- 학급명
    chapter JSONB DEFAULT '{}'::jsonb,   -- 해당 수업 단원
    concept TEXT NOT NULL,               -- 1. 배운 핵심 개념
    explained TEXT NOT NULL,             -- 2. 친구에게 쉽게 설명하기
    discovered TEXT DEFAULT '',          -- 3. 새롭게 알게 된 점 / 풀린 점
    plan TEXT DEFAULT '',                -- 4. 앞으로의 실천 계획
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 행 수준 보안 (Row Level Security, RLS) 활성화
-- ==============================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_entries ENABLE ROW LEVEL SECURITY;

-- 누구나 수업코드 및 수업 정보 조회 가능
CREATE POLICY "수업 정보 공개 조회"
ON public.classes FOR SELECT
USING (true);

-- 수업 생성 및 수정 허용 (교사)
CREATE POLICY "수업 등록 및 수정 허용"
ON public.classes FOR ALL
USING (true);

-- 학생 명렬 조회 및 등록 허용
CREATE POLICY "명렬표 조회 및 등록 허용"
ON public.students FOR ALL
USING (true);

-- 성찰 일기 등록 허용 (학생)
CREATE POLICY "성찰 일기 등록 허용"
ON public.reflection_entries FOR INSERT
WITH CHECK (true);

-- 성찰 일기 조회 정책 (누구나 본인 학번 또는 교사 대시보드에서 조회)
CREATE POLICY "성찰 일기 조회 허용"
ON public.reflection_entries FOR SELECT
USING (true);

-- 인덱스 생성 (빠른 검색 및 필터링 속도 최적화)
CREATE INDEX IF NOT EXISTS idx_classes_code ON public.classes(code);
CREATE INDEX IF NOT EXISTS idx_entries_class_id ON public.reflection_entries(class_id);
CREATE INDEX IF NOT EXISTS idx_entries_student_number ON public.reflection_entries(student_number);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.reflection_entries(date);
