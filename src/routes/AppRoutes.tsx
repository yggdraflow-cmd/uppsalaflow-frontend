import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { AppLayout } from "../layouts/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { BusinessesPage } from "../pages/BusinessesPage";
import { ClientsPage } from "../pages/ClientsPage";
import { ServicesPage } from "../pages/ServicesPage";
import { ProfessionalsPage } from "../pages/ProfessionalsPage";
import { AppointmentsPage } from "../pages/AppointmentsPage";
import { PublicBookingPage } from "../pages/PublicBookingPage";
import { SettingsPage } from "../pages/SettingsPage";

function ProtectedPage({ children }: { children: ReactNode }) {
  return (
    <PrivateRoute>
      <AppLayout>{children}</AppLayout>
    </PrivateRoute>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedPage>
            <DashboardPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/businesses"
        element={
          <ProtectedPage>
            <BusinessesPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedPage>
            <ClientsPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/services"
        element={
          <ProtectedPage>
            <ServicesPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/professionals"
        element={
          <ProtectedPage>
            <ProfessionalsPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedPage>
            <AppointmentsPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedPage>
            <SettingsPage />
          </ProtectedPage>
        }
      />

      <Route path="/agendar/:slug" element={<PublicBookingPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
