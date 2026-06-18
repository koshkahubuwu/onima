"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export function QuizBlock({
  postId,
  questions,
  previousScore,
}: {
  postId: string;
  questions: QuizQuestion[];
  previousScore: { score: number; total: number } | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number; correctOptionsByQuestion: Record<string, string> } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id]);

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
      }),
    });
    if (res.status === 401) {
      router.push("/login");
      setLoading(false);
      return;
    }
    if (res.ok) setResult(await res.json());
    setLoading(false);
  }

  if (previousScore && !result) {
    return (
      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300">
        📝 Quiz · Ya lo completaste: {previousScore.score}/{previousScore.total}
      </div>
    );
  }

  if (result) {
    return (
      <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-3 text-sm dark:border-violet-900 dark:bg-violet-900/20">
        <p className="font-semibold text-violet-700 dark:text-violet-300">
          🎉 Resultado: {result.score}/{result.total}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-violet-500">📝 Quiz</span>
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
          <p className="mb-2 text-sm font-medium">
            {i + 1}. {q.text}
          </p>
          <div className="flex flex-col gap-1">
            {q.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        disabled={!allAnswered || loading}
        onClick={submit}
        className="self-end rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar respuestas"}
      </button>
    </div>
  );
}
