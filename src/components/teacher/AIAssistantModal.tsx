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
  Shield,
  FileText,
  Loader2,
  DollarSign,
  Activity,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  geminiService,
  GEMINI_MODELS,
  ApiUsageSummary,
  ApiUsageRecord,
} from "@/engine/geminiService";
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

  // 학생 데이터 비학습(익명화) 및 결제 티어 설정
  const [anonymizeStudent, setAnonymizeStudent] = useState(geminiService.getAnonymizeSetting());
  const [isPaidTier, setIsPaidTier] = useState(geminiService.getPaidTierSetting());

  // API 사용량 및 요금 분석 상태
  const [usageSummary, setUsageSummary] = useState<ApiUsageSummary>(geminiService.getUsageSummary());
  const [showUsageDetails, setShowUsageDetails] = useState(false);
  const [lastCallUsage, setLastCallUsage] = useState<{
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    costUSD: number;
    costKRW: number;
  } | null>(null);

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
      setShowKeyConfig(!savedKey);
      setSelectedModel(geminiService.getModel());
      setAnonymizeStudent(geminiService.getAnonymizeSetting());
      setIsPaidTier(geminiService.getPaidTierSetting());
      setUsageSummary(geminiService.getUsageSummary());

      if (uniqueStudents.length > 0 && !selectedStudentNumber) {
        setSelectedStudentNumber(uniqueStudents[0].number);
      }
    }
  }, [isOpen, uniqueStudents, selectedStudentNumber]);

  if (!isOpen) return null;

  // API 키 및 옵션 저장
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert("API 키를 입력해주세요.");
      return;
    }
    geminiService.saveApiKey(apiKey.trim());
    geminiService.saveModel(selectedModel);
    geminiService.saveAnonymizeSetting(anonymizeStudent);
    geminiService.savePaidTierSetting(isPaidTier);
    setIsKeySaved(true);
    setShowKeyConfig(false);
    setErrorMessage(null);
  };

  // 비학습 토글 변경
  const handleToggleAnonymize = (val: boolean) => {
    setAnonymizeStudent(val);
    geminiService.saveAnonymizeSetting(val);
  };

  // 유료 티어 토글 변경
  const handleTogglePaidTier = (val: boolean) => {
    setIsPaidTier(val);
    geminiService.savePaidTierSetting(val);
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

  // 사용량 통계 초기화
  const handleResetUsage = () => {
    if (confirm("누적된 API 사용량 및 요금 통계 기록을 초기화하시겠습니까?")) {
      geminiService.resetUsage();
      setUsageSummary(geminiService.getUsageSummary());
      setLastCallUsage(null);
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
      apiKey,
      anonymizeStudent
    );

    setIsLoading(false);

    if (res.success && res.result) {
      setGeneratedDraft(res.result);
      if (res.usage) {
        setLastCallUsage(res.usage);
        setUsageSummary(geminiService.getUsageSummary());
      }
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 text-slate-800 space-y-5 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
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

        {/* 상단: API 키 설정 및 비학습/보안 요약 배너 */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-600">
                API 키와 사용량은 서버로 전송되지 않으며, <strong>선생님 브라우저에만 안전 보관</strong>됩니다.
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

          {/* 학생 데이터 비학습 및 익명화 보호 가드 토글 */}
          <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={anonymizeStudent}
                onChange={(e) => handleToggleAnonymize(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-bold text-slate-700 flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>학생 데이터 비학습(No Training) 보장 익명화 전송</span>
              </span>
              <span className="text-[11px] text-slate-500">
                (실명·학번을 &apos;학생 본인&apos;으로 마스킹하여 AI에 전송)
              </span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer select-none text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={isPaidTier}
                onChange={(e) => handleTogglePaidTier(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
              />
              <span>Google Cloud 유료 키 (구글 약관상 AI 학습 미사용 보장)</span>
            </label>
          </div>
        </div>

        {/* 접이식 API 키 & 모델 환경설정 폼 */}
        {showKeyConfig && (
          <form
            onSubmit={handleSaveApiKey}
            className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3 text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center space-x-1.5">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Gemini API 키 및 공식 최신 모델 설정</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline flex items-center space-x-1 text-[11px] font-semibold"
              >
                <span>무료 키 발급받기 (Google AI Studio)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Gemini API Key (AIzaSy...)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Google AI Studio에서 발급받은 API 키 입력"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  공식 최신 AI 모델 선택
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {GEMINI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              {isKeySaved && (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  키 삭제
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                키 &amp; 설정 저장
              </button>
            </div>
          </form>
        )}

        {/* 메인 작업 영역: 대상 학생 선택 및 일기 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-1">
          {/* 좌측: 학생 선택 및 누적 일기 현황 */}
          <div className="md:col-span-1 space-y-3">
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {uniqueStudents.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number} {s.name} ({entries.filter((e) => e.studentNumber === s.number).length}건)
                  </option>
                ))}
              </select>
            </div>

            {/* 선택 학생의 누적 성찰 일기 요약 카드 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="font-bold text-slate-700">누적 성찰 일기 현황</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  총 {studentEntries.length}건
                </span>
              </div>

              {studentEntries.length === 0 ? (
                <p className="text-slate-400 text-[11px] py-4 text-center">
                  작성된 성찰 일기가 없습니다.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {studentEntries.map((e, idx) => (
                    <div
                      key={e.id || idx}
                      className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span>{e.date}</span>
                        <span className="text-blue-600 font-semibold truncate max-w-[120px]">
                          {e.chapter.minor}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium line-clamp-1">
                        • {e.answers.concept}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 초안 생성 실행 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || studentEntries.length === 0}
              className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
                isLoading || studentEntries.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>수학교과 세특 초안 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>세특 초안 생성하기</span>
                </>
              )}
            </button>
          </div>

          {/* 우측: 생성된 세특 초안, 글자수/바이트 계산기, 나이스 1클릭 복사 */}
          <div className="md:col-span-2 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>교육부 기재요령 맞춤 세특 초안</span>
              </label>

              {/* 글자수 및 바이트(NEIS) 실시간 계산 배지 */}
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="text-slate-500">
                  공백포함: <strong className="text-slate-800">{charCountWithSpace}</strong>자
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">
                  공백제외: <strong className="text-slate-800">{charCountWithoutSpace}</strong>자
                </span>
                <span className="text-slate-300">|</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md border ${
                    byteCount > 1500
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                  title="나이스(NEIS) 기준 한글 3Byte, 영문/공백 1Byte (최대 1500 Bytes)"
                >
                  나이스 {byteCount} / 1500 Bytes
                </span>
              </div>
            </div>

            {/* 에러 메시지 배너 */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 세특 본문 에디터 */}
            <div className="relative flex-1 flex flex-col min-h-[220px]">
              <textarea
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                placeholder="[세특 초안 생성하기] 버튼을 누르면, 학생이 1학기 동안 작성한 개념 내면화·수학적 의사소통·오개념 극복 성찰 일기를 종합 분석하여 400~500자 분량의 세특 초안이 자동으로 완성됩니다."
                className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-normal"
              />
            </div>

            {/* 하단 버튼 및 복사 피드백 */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                💡 생성된 내용은 직접 자유롭게 편집/보완하여 나이스에 반영할 수 있습니다.
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  disabled={!generatedDraft}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !generatedDraft
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : isCopied
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>나이스 복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>📋 나이스 1클릭 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 실시간 API 사용량 분석 & 예상 발생 요금 계산기 바 */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-slate-700 font-bold">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>누적 API 사용량:</span>
                <span className="text-indigo-600 font-extrabold">{usageSummary.totalCalls}회</span>
                <span className="text-slate-400 text-[11px]">({usageSummary.totalTokens.toLocaleString()} 토큰)</span>
              </div>

              <span className="text-slate-300">|</span>

              <div className="flex items-center space-x-1 text-slate-700">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>예상 발생 요금:</span>
                <strong className="text-emerald-700 font-bold">
                  약 ₩{usageSummary.totalCostKRW.toLocaleString()}원
                </strong>
                <span className="text-[11px] text-slate-400">
                  (${usageSummary.totalCostUSD.toFixed(4)} USD)
                </span>
              </div>

              {lastCallUsage && (
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 animate-in fade-in">
                  이번 생성: {lastCallUsage.totalTokens} 토큰 (약 {lastCallUsage.costKRW}원)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowUsageDetails(!showUsageDetails)}
                className="text-[11px] text-slate-600 hover:text-indigo-600 font-semibold flex items-center space-x-0.5 cursor-pointer"
              >
                <span>상세 분석 / 요금 안내</span>
                {showUsageDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
              {usageSummary.totalCalls > 0 && (
                <button
                  type="button"
                  onClick={handleResetUsage}
                  className="text-[11px] text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                  title="사용량 통계 초기화"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 접이식 상세 사용량 내역 및 요금 가이드 */}
          {showUsageDetails && (
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5 text-[11px] text-slate-600 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">💡 무료 쿼터 및 과금 안내</span>
                  <p className="leading-relaxed">
                    • <strong>무료 티어:</strong> 일일 1,500회(1500 RPD)까지 요금이 전혀 발생하지 않습니다.
                  </p>
                  <p className="leading-relaxed">
                    • <strong>유료 티어:</strong> 무료 한도 초과 시 1회 생성(약 600~800토큰)당 <strong>약 0.2원 ~ 0.5원</strong>(1천 회 생성 시 약 300~500원)의 초저비용이 종량제로 청구됩니다.
                  </p>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">🛡️ 비학습(No Training) 정책 요약</span>
                  <p className="leading-relaxed">
                    • <strong>익명화 전송 활성화:</strong> 학생의 이름과 학번을 마스킹하여 AI에 전달하므로, 구글에 학생 정보가 일체 학습되지 않습니다.
                  </p>
                  <p className="leading-relaxed">
                    • <strong>유료 결제 계정 키:</strong> 구글 클라우드 공식 약관에 의해 전송된 프롬프트와 응답이 AI 모델 학습 데이터로 일체 활용되지 않습니다.
                  </p>
                </div>
              </div>

              {/* 최근 회차별 호출 기록 */}
              {usageSummary.recentRecords.length > 0 && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">최근 생성 이력 (최근 {usageSummary.recentRecords.length}건)</span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono">
                    {usageSummary.recentRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 text-[10px]"
                      >
                        <span className="text-slate-400">{rec.timestamp}</span>
                        <span className="text-slate-700 font-sans font-medium">{rec.studentIdentifier}</span>
                        <span className="text-indigo-600">{rec.totalTokens} tokens</span>
                        <span className="text-emerald-700 font-bold">약 ₩{rec.costKRW}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
