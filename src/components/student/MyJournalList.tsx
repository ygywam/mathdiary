"use client";

import React from "react";
import { ReflectionEntry } from "@/store/useJournalStore";
import { Calendar, BookOpen, Clock, Lightbulb, Compass, Award } from "lucide-react";

interface MyJournalListProps {
  entries: ReflectionEntry[];
  studentName: string;
}

export const MyJournalList: React.FC<MyJournalListProps> = ({
  entries,
  studentName,
}) => {
  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <h3 className="text-base font-bold text-slate-700">작성된 성찰 일기가 없습니다</h3>
        <p className="text-xs text-slate-500 mt-1">
          오늘 수업 후 첫 번째 수학 성찰 일기를 기록해보세요.
        </p>
      </div>
    );
  }

  return (
    <div data-tour="tour-my-entries" className="max-w-2xl mx-auto my-6 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>나의 수학 성장 일기장</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {studentName} 학생이 지금까지 작성한 누적 성찰 기록입니다.
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          총 {entries.length}편 기록됨
        </span>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            {/* 일자 및 단원 헤더 */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {entry.subject}
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {entry.chapter.major}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{entry.date}</span>
                <Clock className="w-3.5 h-3.5 ml-1" />
                <span>{entry.createdAt.split(" ")[1] || ""}</span>
              </div>
            </div>

            {/* 단원 소주제 */}
            <div className="py-2.5">
              <span className="text-xs font-semibold text-slate-800">
                {entry.chapter.minor}
                {entry.chapter.topic && ` · ${entry.chapter.topic}`}
              </span>
            </div>

            {/* 4대 답변 내용 */}
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">
                  1. 배운 핵심 개념
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {entry.answers.concept || "(미입력)"}
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">
                  2. 친구에게 설명하기
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {entry.answers.explained || "(미입력)"}
                </p>
              </div>

              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80">
                <span className="font-bold text-amber-800 flex items-center space-x-1 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>3. 새롭게 알게 된 점 / 풀린 오개념</span>
                </span>
                <p className="text-amber-950 leading-relaxed">
                  {entry.answers.discovered || "(미입력)"}
                </p>
              </div>

              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/80">
                <span className="font-bold text-blue-800 flex items-center space-x-1 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>4. 앞으로의 계획</span>
                </span>
                <p className="text-blue-950 leading-relaxed">
                  {entry.answers.plan || "(미입력)"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
