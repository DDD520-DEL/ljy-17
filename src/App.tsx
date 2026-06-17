import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard";
import AncestorsList from "@/pages/Ancestors";
import AncestorDetail from "@/pages/Ancestors/AncestorDetail";
import AncestorForm from "@/pages/Ancestors/AncestorForm";
import RitualsList from "@/pages/Rituals";
import RitualForm from "@/pages/Rituals/RitualForm";
import RitualTemplatesList from "@/pages/RitualTemplates";
import TemplateForm from "@/pages/RitualTemplates/TemplateForm";
import ReservationsList from "@/pages/Reservations";
import ReservationForm from "@/pages/Reservations/ReservationForm";
import RitualTimeline from "@/pages/Timeline";
import FamilyTree from "@/pages/FamilyTree";
import MembersList from "@/pages/Members";
import SettingsPage from "@/pages/Settings";
import Album from "@/pages/Album";
import CalendarPage from "@/pages/Calendar";
import AuthPage from "@/pages/Auth";
import FamilyEventsList from "@/pages/FamilyEvents";
import FamilyEventForm from "@/pages/FamilyEvents/FamilyEventForm";
import OfferingsPage from "@/pages/Offerings";
import { useAppStore } from "@/store/useAppStore";

function AppInitializer() {
  const { initialize, checkAuth, user, syncState, syncNow, refreshPendingChanges, isInitialized } = useAppStore();
  const location = useLocation();
  const autoSyncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    refreshPendingChanges();
  }, [refreshPendingChanges, location.pathname]);

  useEffect(() => {
    if (user && syncState.autoSyncEnabled && isInitialized && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      const timer = setTimeout(() => {
        syncNow(async () => null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, syncState.autoSyncEnabled, isInitialized, syncNow]);

  useEffect(() => {
    if (user && syncState.autoSyncEnabled) {
      autoSyncTimerRef.current = setInterval(() => {
        refreshPendingChanges();
        const pending = useAppStore.getState().syncState.pendingChanges;
        if (pending > 0 && useAppStore.getState().syncState.status === 'idle') {
          syncNow(async () => null);
        }
      }, 60000);
    }

    return () => {
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
      }
    };
  }, [user, syncState.autoSyncEnabled, syncNow, refreshPendingChanges]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AppInitializer />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          <Route path="ancestors" element={<AncestorsList />} />
          <Route path="ancestors/new" element={<AncestorForm mode="create" />} />
          <Route path="ancestors/:id" element={<AncestorDetail />} />
          <Route path="ancestors/:id/edit" element={<AncestorForm mode="edit" />} />
          
          <Route path="rituals" element={<RitualsList />} />
          <Route path="rituals/new" element={<RitualForm mode="create" />} />
          <Route path="rituals/:id/edit" element={<RitualForm mode="edit" />} />
          
          <Route path="ritual-templates" element={<RitualTemplatesList />} />
          <Route path="ritual-templates/new" element={<TemplateForm mode="create" />} />
          <Route path="ritual-templates/:id/edit" element={<TemplateForm mode="edit" />} />
          
          <Route path="reservations" element={<ReservationsList />} />
          <Route path="reservations/new" element={<ReservationForm mode="create" />} />
          <Route path="reservations/:id/edit" element={<ReservationForm mode="edit" />} />
          
          <Route path="family-events" element={<FamilyEventsList />} />
          <Route path="family-events/new" element={<FamilyEventForm mode="create" />} />
          <Route path="family-events/:id/edit" element={<FamilyEventForm mode="edit" />} />
          
          <Route path="timeline" element={<RitualTimeline />} />
          
          <Route path="family-tree" element={<FamilyTree />} />
          
          <Route path="members" element={<MembersList />} />
          
          <Route path="offerings" element={<OfferingsPage />} />
          
          <Route path="album" element={<Album />} />
          
          <Route path="calendar" element={<CalendarPage />} />
          
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
