import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import { getHomePath } from "./pages/routeHelpers";

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={currentUser ? getHomePath(currentUser.role) : "/login"} replace />}
      />
      <Route
        path="/login"
        element={currentUser ? <Navigate to={getHomePath(currentUser.role)} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to={getHomePath(currentUser.role)} replace /> : <Register />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["normal_user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={["store_owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
