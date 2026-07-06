import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { ClientPortalLayout } from "../layouts/ClientPortalLayout";
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
import { SettingsPage } from "../pages/SettingsPage";
import { ClientLoginPage } from "../pages/ClientLoginPage";
import { ClientRegisterPage } from "../pages/ClientRegisterPage";
import { ClientAppointmentsPage } from "../pages/ClientAppointmentsPage";
import { getToken, getUser } from "../services/authStorage";
import type { User } from "../types/auth";

function getHomePath(user: User) {
  if (user.role === "ADMIN") {
    return "/admin";
  }

  if (user.role === "CLIENT") {
    return "/cliente/agendamentos";
  }

  return "/dashboard";
}

function CustomerPage({ children }: { children: ReactNode }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "CLIENT") {
    return <Navigate to="/cliente/agendamentos" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AdminProtectedPage({ children }: { children: ReactNode }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function ClientProtectedPage({ children }: { children: ReactNode }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/cliente/login" replace />;
  }

  if (user.role !== "CLIENT") {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}

function HomeRedirect() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomePath(user)} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/cliente/login" element={<ClientLoginPage />} />
      <Route path="/cliente/cadastro" element={<ClientRegisterPage />} />

      <Route
        path="/cliente/agendamentos"
        element={
          <ClientProtectedPage>
            <ClientAppointmentsPage />
          </ClientProtectedPage>
        }
      />

      <Route
        path="/cliente/conta"
        element={
          <ClientProtectedPage>
            <AccountPage />
          </ClientProtectedPage>
        }
      />

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
        path="/settings"
        element={
          <CustomerPage>
            <SettingsPage />
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
