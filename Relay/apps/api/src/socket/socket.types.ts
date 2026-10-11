import type { Socket } from "socket.io";

export interface ClientToServerEvents {
  "conversation:join": (
    conversationId: string,
    callback?: (response: { success: boolean; error?: string }) => void,
  ) => void;
  "message:send": (
    payload: { conversationId: string; content: string },
    callback?: (response: { success: boolean; messageId?: string; error?: string }) => void,
  ) => void;
}

export interface ServerToClientEvents {
  "conversation:joined": (conversationId: string) => void;
  "message:new": (message: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date;
  }) => void;
  "message:error": (error: { message: string }) => void;
}

export interface InterServerEvents {}
export interface SocketData { userId?: string }

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
