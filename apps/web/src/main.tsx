import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { Toaster } from "@acme/ui";

import { Login, Threads } from "./pages";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/messages" replace />;
  }

  return children;
};

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/messages" replace />,
    },
    {
      path: "/messages",
      element: (
        <ProtectedRoute>
          <Threads />
        </ProtectedRoute>
      ),
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactQueryProvider>
      <AuthProvider>
        <Routes />
        <Toaster />
      </AuthProvider>
    </ReactQueryProvider>
  </StrictMode>,
);
