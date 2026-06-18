import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../src/lib/prisma";
import { isRoomMember, sendMessage } from "../src/lib/chat";

const PORT = process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 4001;
const ORIGIN = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

interface SocketAuthPayload {
  userId: string;
  username: string;
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: ORIGIN, credentials: true },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) {
    next(new Error("No autenticado"));
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as SocketAuthPayload;
    socket.data.userId = payload.userId;
    socket.data.username = payload.username;
    next();
  } catch {
    next(new Error("Token inválido"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;

  socket.on("join-room", async (roomId: string) => {
    if (await isRoomMember(roomId, userId)) {
      socket.join(roomId);
    }
  });

  socket.on("leave-room", (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on("send-message", async (data: { roomId: string; content: string }) => {
    const { roomId, content } = data;
    if (!content?.trim() || !(await isRoomMember(roomId, userId))) return;
    const message = await sendMessage(roomId, userId, content.trim());
    io.to(roomId).emit("new-message", message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
