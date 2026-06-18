"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; username: string; avatarUrl: string | null };
}

export function ChatRoom({
  roomId,
  currentUserId,
  initialMessages,
}: {
  roomId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let socket: Socket;

    async function connect() {
      const res = await fetch("/api/socket-token");
      if (!res.ok) return;
      const { token } = await res.json();

      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4001", {
        auth: { token },
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join-room", roomId);
      });
      socket.on("disconnect", () => setConnected(false));
      socket.on("connect_error", (err) => console.error("socket connect_error", err.message));
      socket.on("new-message", (message: Message) => {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      });
    }

    connect();

    return () => {
      socket?.emit("leave-room", roomId);
      socket?.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit("send-message", { roomId, content: text.trim() });
    setText("");
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-2 text-sm dark:border-white/10">
        <span className="text-neutral-400">
          {connected ? "Conectado" : "Conectando..."}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 flex flex-col ${m.senderId === currentUserId ? "items-end" : "items-start"}`}
          >
            <span className="text-xs text-neutral-400">{m.sender.username}</span>
            <span
              className={
                m.senderId === currentUserId
                  ? "max-w-xs rounded-2xl bg-violet-600 px-3 py-2 text-sm text-white"
                  : "max-w-xs rounded-2xl bg-black/5 px-3 py-2 text-sm dark:bg-white/10"
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-black/10 p-3 dark:border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={2000}
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:bg-neutral-950 dark:border-white/10"
        />
        <button
          type="submit"
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
