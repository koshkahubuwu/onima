"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PostKind = "BLOG" | "POLL" | "QUIZ" | "WIKI";

interface QuizOptionDraft {
  text: string;
  isCorrect: boolean;
}
interface QuizQuestionDraft {
  text: string;
  options: QuizOptionDraft[];
}

const KIND_LABEL: Record<PostKind, string> = {
  BLOG: "📝 Blog",
  POLL: "📊 Encuesta",
  QUIZ: "🧠 Quiz",
  WIKI: "📖 Wiki",
};

export function NewPostForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<PostKind>("BLOG");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([
    { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle("");
    setContent("");
    setPollOptions(["", ""]);
    setQuestions([{ text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
    setKind("BLOG");
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body: Record<string, unknown> = { title, content };
    if (kind === "POLL") {
      body.type = "POLL";
      body.options = pollOptions.map((o) => o.trim()).filter(Boolean);
    } else if (kind === "QUIZ") {
      body.type = "QUIZ";
      body.questions = questions.map((q) => ({
        text: q.text,
        options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      }));
    } else if (kind === "WIKI") {
      body.type = "WIKI";
    }

    const res = await fetch(`/api/communities/${slug}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Algo salió mal");
      return;
    }

    reset();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 w-full rounded-xl border border-dashed border-black/15 bg-white px-4 py-3 text-left text-neutral-400 hover:border-violet-400 hover:text-violet-600 dark:border-white/15 dark:bg-neutral-900"
      >
        ¿Qué quieres compartir?
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="flex gap-1 overflow-x-auto">
        {(Object.keys(KIND_LABEL) as PostKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
              kind === k ? "bg-violet-600 text-white" : "bg-black/5 text-neutral-500 dark:bg-white/10"
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <input
        required
        maxLength={120}
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:bg-neutral-950 dark:border-white/10"
      />
      <textarea
        required
        maxLength={5000}
        rows={4}
        placeholder={kind === "WIKI" ? "Contenido de la entrada wiki..." : "Escribe algo..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:bg-neutral-950 dark:border-white/10"
      />

      {kind === "POLL" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-neutral-400">Opciones de la encuesta</span>
          {pollOptions.map((opt, i) => (
            <input
              key={i}
              required
              maxLength={80}
              placeholder={`Opción ${i + 1}`}
              value={opt}
              onChange={(e) =>
                setPollOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))
              }
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
            />
          ))}
          <div className="flex gap-2">
            {pollOptions.length < 8 && (
              <button
                type="button"
                onClick={() => setPollOptions((prev) => [...prev, ""])}
                className="text-xs text-violet-600 hover:underline"
              >
                + Añadir opción
              </button>
            )}
            {pollOptions.length > 2 && (
              <button
                type="button"
                onClick={() => setPollOptions((prev) => prev.slice(0, -1))}
                className="text-xs text-neutral-400 hover:underline"
              >
                Quitar última
              </button>
            )}
          </div>
        </div>
      )}

      {kind === "QUIZ" && (
        <div className="flex flex-col gap-3">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
              <input
                required
                maxLength={200}
                placeholder={`Pregunta ${qi + 1}`}
                value={q.text}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((item, idx) => (idx === qi ? { ...item, text: e.target.value } : item))
                  )
                }
                className="mb-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
              />
              <div className="flex flex-col gap-1">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={opt.isCorrect}
                      onChange={() =>
                        setQuestions((prev) =>
                          prev.map((item, idx) =>
                            idx === qi
                              ? {
                                  ...item,
                                  options: item.options.map((o, oidx) => ({
                                    ...o,
                                    isCorrect: oidx === oi,
                                  })),
                                }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      required
                      maxLength={120}
                      placeholder={`Opción ${oi + 1} (marca la correcta)`}
                      value={opt.text}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item, idx) =>
                            idx === qi
                              ? {
                                  ...item,
                                  options: item.options.map((o, oidx) =>
                                    oidx === oi ? { ...o, text: e.target.value } : o
                                  ),
                                }
                              : item
                          )
                        )
                      }
                      className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm dark:bg-neutral-950 dark:border-white/10"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setQuestions((prev) => [
                  ...prev,
                  { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] },
                ])
              }
              className="text-xs text-violet-600 hover:underline"
            >
              + Añadir pregunta
            </button>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => setQuestions((prev) => prev.slice(0, -1))}
                className="text-xs text-neutral-400 hover:underline"
              >
                Quitar última
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}
