import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { BusinessesPage } from "../pages/BusinessesPage";
import { ClientsPage } from "../pages/ClientsPage";
import { ServicesPage } from "../pages/ServicesPage";
import { ProfessionalsPage } from "../pages/ProfessionalsPage";
import { AppointmentsPage } from "../pages/AppointmentsPage";
import { PublicBookingPage } from "../pages/PublicBookingPage";
import { AdminPage } from "../pages/AdminPage";
import { AccountPage } from "../pages/AccountPage";
import { getToken, getUser } from "../services/authStorage";

function CustomerPage({ children }: { children: ReactNode }) {
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AdminProtectedPage({ children }: { children: ReactNode }) {
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function HomeRedirect() {
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <AdminProtectedPage>
            <AdminPage />
          </AdminProtectedPage>
        }
      />

      <Route
        path="/admin/account"
        element={
          <AdminProtectedPage>
            <AccountPage />
          </AdminProtectedPage>
        }
      />

      <Route
        path="/account"
        element={
          <CustomerPage>
            <AccountPage />
          </CustomerPage>
        }
      />

      <Route
        path="/dashboard"
        element={
          <CustomerPage>
            <DashboardPage />
          </CustomerPage>
        }
      />

      <Route
        path="/businesses"
        element={
          <CustomerPage>
            <BusinessesPage />
          </CustomerPage>
        }
      />

      <Route
        path="/clients"
        element={
          <CustomerPage>
            <ClientsPage />
          </CustomerPage>
        }
      />

      <Route
        path="/services"
        element={
          <CustomerPage>
            <ServicesPage />
          </CustomerPage>
        }
      />

      <Route
        path="/professionals"
        element={
          <CustomerPage>
            <ProfessionalsPage />
          </CustomerPage>
        }
      />

      <Route
        path="/appointments"
        element={
          <CustomerPage>
            <AppointmentsPage />
          </CustomerPage>
        }
      />

      <Route path="/agendar/:slug" element={<PublicBookingPage />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
