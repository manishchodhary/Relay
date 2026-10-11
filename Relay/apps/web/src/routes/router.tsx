import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Login from "../features/auth/page/Login";
import Register from "../features/auth/page/Register";
import Landing from "../features/landing/Landing";
import Home from "../features/chat/pages/Home";
import ChatRoom from "../features/chat/pages/ChatRoom";
import Authlayout from "../layouts/Authlayout";

function ProtectedLayout() {
  return localStorage.getItem("accessToken") ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <Authlayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/chat/:conversationId", element: <ChatRoom /> },
    ],
  },
]);
