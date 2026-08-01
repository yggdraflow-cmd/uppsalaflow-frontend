import { useEffect, useState, type ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { ClientPortalLayout } from "../layouts/ClientPortalLayout";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { BusinessesPage } from "../pages/BusinessesPage";
import { BusinessOnboardingPage } from "../pages/BusinessOnboardingPage";
import { PlanSelectionPage } from "../pages/PlanSelectionPage";
import { ClientsPage } from "../pages/ClientsPage";
import { ServicesPage } from "../pages/ServicesPage";
import { ProfessionalsPage } from "../pages/ProfessionalsPage";
import { AppointmentsPage } from "../pages/AppointmentsPage";
import { PublicBookingPage } from "../pages/PublicBookingPage";
import { AdminPage } from "../pages/AdminPage";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { AccountPage } from "../pages/AccountPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ClientLoginPage } from "../pages/ClientLoginPage";
import { ClientRegisterPage } from "../pages/ClientRegisterPage";
import { ClientAppointmentsPage } from "../pages/ClientAppointmentsPage";
import { api } from "../services/api";
import { getToken, getUser } from "../services/authStorage";
import type { User } from "../types/auth";
import type { Business } from "../types/business";

function getHomePath(user: User) {
  if (user.role === "ADMIN") {
    return "/admin";
  }

  if (user.role === "CLIENT") {
    return "/cliente/agendamentos";
  }

  return "/dashboard";
}

function BusinessOnboardingGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkBusinessSegment() {
      try {
        setIsChecking(true);

        const response = await api.get<Business[]>("/businesses");
        const primaryBusiness = response.data[0];
        const needsOnboarding =
          response.data.length === 0 ||
          !primaryBusiness?.segment;

        if (!isMounted) {
          return;
        }

        if (needsOnboarding) {
          navigate("/business-onboarding", { replace: true });
          return;
        }

        const hasPlatformAccess =
          primaryBusiness.status === "ACTIVE" &&
          primaryBusiness.subscription?.status === "ACTIVE";

        if (!hasPlatformAccess) {
          navigate(
            `/business-plans?businessId=${primaryBusiness.id}`,
            { replace: true }
          );
          return;
        }
      } catch {
        if (!isMounted) {
          return;
        }
      }

      setIsChecking(false);
    }

    checkBusinessSegment();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-[28px] bg-white/90 px-8 py-6 text-sm font-black text-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
          Carregando configuração do negócio...
        </div>
      </div>
    );
  }

  return <>{children}</>;
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

  return (
    <AppLayout>
      <BusinessOnboardingGate>{children}</BusinessOnboardingGate>
    </AppLayout>
  );
}

function OnboardingProtectedPage({
  children,
}: {
  children: ReactNode;
}) {
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

  return <>{children}</>;
}

function AdminProtectedPage({
  children,
}: {
  children: ReactNode;
}) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function ClientProtectedPage({
  children,
}: {
  children: ReactNode;
}) {
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

function ClientBookingProtectedPage({
  children,
}: {
  children: ReactNode;
}) {
  const token = getToken();
  const user = getUser();
  const location = useLocation();

  if (!token || !user) {
    const redirectPath = encodeURIComponent(location.pathname);

    return (
      <Navigate
        to={`/cliente/login?redirect=${redirectPath}`}
        replace
      />
    );
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

      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />

      <Route
        path="/cliente/login"
        element={<ClientLoginPage />}
      />

      <Route
        path="/cliente/cadastro"
        element={<ClientRegisterPage />}
      />

      <Route
        path="/business-onboarding"
        element={
          <OnboardingProtectedPage>
            <BusinessOnboardingPage />
          </OnboardingProtectedPage>
        }
      />

      <Route
        path="/business-plans"
        element={
          <OnboardingProtectedPage>
            <PlanSelectionPage />
          </OnboardingProtectedPage>
        }
      />

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

      <Route
        path="/agendar/:slug"
        element={
          <ClientBookingProtectedPage>
            <PublicBookingPage />
          </ClientBookingProtectedPage>
        }
      />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
