"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  X,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  User,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileText,
  Loader2,
} from "lucide-react";
import { geminiService, GEMINI_MODELS } from "@/engine/geminiService";
import { ClassSession, ReflectionEntry } from "@/store/useJournalStore";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass: ClassSession | null;
  entries: ReflectionEntry[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentClass,
  entries,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [selectedModel, setSelectedModel] = useState(geminiService.getModel());

  // 선택된 학생 학번
  const [selectedStudentNumber, setSelectedStudentNumber] = useState<string>("");
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 고유 학생 목록 추출
  const uniqueStudents = Array.from(
    new Map(
      entries.map((e) => [
        e.studentNumber,
        { number: e.studentNumber, name: e.studentName },
      ])
    ).values()
  ).sort((a, b) => a.number.localeCompare(b.number));

  useEffect(() => {
    if (isOpen) {
      const savedKey = geminiService.getApiKey();
      setApiKey(savedKey);
      setIsKeySaved(!!savedKey);
      setShowKeyConfig(!savedKey); // 키가 없으면 키 입력창 먼저 노출
      setSelectedModel(geminiService.getModel());

      if (uniqueStudents.length > 0 && !selectedStudentNumber) {
        setSelectedStudentNumber(uniqueStudents[0].number);
      }
    }
  }, [isOpen, uniqueStudents, selectedStudentNumber]);

  if (!isOpen) return null;

  // API 키 저장
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert("API 키를 입력해주세요.");
      return;
    }
    geminiService.saveApiKey(apiKey.trim());
    geminiService.saveModel(selectedModel);
    setIsKeySaved(true);
    setShowKeyConfig(false);
    setErrorMessage(null);
  };

  // API 키 삭제
  const handleRemoveApiKey = () => {
    if (confirm("저장된 API 키를 삭제하시겠습니까?")) {
      geminiService.removeApiKey();
      setApiKey("");
      setIsKeySaved(false);
      setShowKeyConfig(true);
    }
  };

  // 선택된 학생의 일기 목록
  const studentEntries = entries.filter(
    (e) => e.studentNumber === selectedStudentNumber
  );
  const currentStudentObj = uniqueStudents.find(
    (s) => s.number === selectedStudentNumber
  );

  // 세특 생성 실행
  const handleGenerate = async () => {
    if (!currentClass) return;
    if (!currentStudentObj) {
      setErrorMessage("생성할 학생을 먼저 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await geminiService.generateMathRecord(
      currentStudentObj.name,
      currentStudentObj.number,
      currentClass.subject,
      studentEntries,
      apiKey
    );

    setIsLoading(false);

    if (res.success && res.result) {
      setGeneratedDraft(res.result);
    } else {
      setErrorMessage(res.error || "생성에 실패했습니다.");
    }
  };

  // 1클릭 복사
  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 나이스 바이트 계산기 (한글 3바이트, 공백/영문 1바이트)
  const calculateBytes = (text: string) => {
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code <= 0x007f) {
        bytes += 1;
      } else {
        bytes += 3;
      }
    }
    return bytes;
  };

  const charCountWithSpace = generatedDraft.length;
  const charCountWithoutSpace = generatedDraft.replace(/\s+/g, "").length;
  const byteCount = calculateBytes(generatedDraft);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 text-slate-800 space-y-6 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>수학교과 세특(과세특) AI 초안 생성</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              교육부 학생부 지침 준수
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 안내 배너 및 API 키 설정 토글 */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-600">
              API 키는 서버로 전송되지 않으며, <strong>선생님 개인 브라우저에만 안전하게 보관</strong>됩니다.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isKeySaved && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✓ 키 등록됨 ({selectedModel})
              </span>
            )}
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="text-blue-600 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showKeyConfig ? "설정 닫기" : "API 키 / 모델 설정"}</span>
            </button>
          </div>
        </div>

        {/* API 키 / 모델 설정 접이식 폼 */}
        {showKeyConfig && (
          <form
            onSubmit={handleSaveApiKey}
            className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Gemini API 키 입력</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-0.5 font-normal text-[11px]"
                  >
                    <span>Google AI Studio에서 무료 키 발급</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... 로 시작하는 키를 붙여넣으세요"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-full sm:w-56">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  사용 모델 (공식 지원)
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GEMINI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              {isKeySaved && (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  키 삭제
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                설정 저장
              </button>
            </div>
          </form>
        )}

        {/* 에러 메시지 알림 */}
        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 메인 작업 영역: 2단 분할 (좌측: 학생 선택 & 일기 요약 / 우측: 세특 초안 에디터) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-hidden">
          {/* 좌측: 학생 선택 & 누적 일기 (5열) */}
          <div className="md:col-span-5 flex flex-col space-y-3 overflow-hidden">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>대상 학생 선택 ({uniqueStudents.length}명)</span>
              </label>
              <select
                value={selectedStudentNumber}
                onChange={(e) => {
                  setSelectedStudentNumber(e.target.value);
                  setGeneratedDraft("");
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {uniqueStudents.length === 0 ? (
                  <option value="">일기를 작성한 학생이 없습니다</option>
                ) : (
                  uniqueStudents.map((st) => (
                    <option key={st.number} value={st.number}>
                      {st.number} {st.name} ({entries.filter((e) => e.studentNumber === st.number).length}건)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 학생 일기 기록 목록 요약 */}
            <div className="flex-1 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 overflow-y-auto space-y-2.5">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between pb-1 border-b border-slate-200">
                <span>누적 성찰 일기 ({studentEntries.length}건)</span>
                <span className="text-blue-600">{currentClass?.subject || "수학"}</span>
              </div>

              {studentEntries.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  선택한 학생의 작성 일기가 없습니다.
                </div>
              ) : (
                studentEntries.map((e, idx) => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-800">#{idx + 1} 차시</span>
                      <span>{e.date}</span>
                    </div>
                    <div className="font-semibold text-blue-700 text-[11px] truncate">
                      {e.chapter.minor || e.chapter.major}
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">
                      💡 {e.answers.concept}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || studentEntries.length === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>세특 초안 심층 분석 및 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>이 학생의 세특 초안 생성하기 ✨</span>
                </>
              )}
            </button>
          </div>

          {/* 우측: 생성된 세특 에디터 & 나이스 1클릭 복사 (7열) */}
          <div className="md:col-span-7 flex flex-col space-y-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>세특 초안 에디터 (자유 수정 가능)</span>
              </label>

              {/* 글자수 & 바이트 실시간 카운터 */}
              <div className="text-[11px] text-slate-500 space-x-2">
                <span>공백포함: <strong className="text-slate-800">{charCountWithSpace}자</strong></span>
                <span>(공백제외 {charCountWithoutSpace}자)</span>
                <span className="text-indigo-600 font-bold border-l pl-2 border-slate-200">
                  {byteCount} / 1500 Bytes
                </span>
              </div>
            </div>

            <textarea
              rows={12}
              value={generatedDraft}
              onChange={(e) => setGeneratedDraft(e.target.value)}
              placeholder="좌측에서 학생을 선택하고 [세특 초안 생성하기] 버튼을 누르면, 학생의 실제 누적 성찰 일기를 바탕으로 교육부 지침에 맞춘 자연스러운 세특 초안이 이곳에 자동 작성됩니다."
              className="flex-1 w-full p-4 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all font-sans"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || studentEntries.length === 0}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 생성</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!generatedDraft}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>나이스(NEIS)용 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>나이스(NEIS)용 1클릭 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 하단 닫기 바 */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
