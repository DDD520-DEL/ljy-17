import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard";
import AncestorsList from "@/pages/Ancestors";
import AncestorDetail from "@/pages/Ancestors/AncestorDetail";
import AncestorForm from "@/pages/Ancestors/AncestorForm";
import RitualsList from "@/pages/Rituals";
import RitualForm from "@/pages/Rituals/RitualForm";
import ReservationsList from "@/pages/Reservations";
import ReservationForm from "@/pages/Reservations/ReservationForm";
import RitualTimeline from "@/pages/Timeline";
import FamilyTree from "@/pages/FamilyTree";
import MembersList from "@/pages/Members";
import SettingsPage from "@/pages/Settings";
import Album from "@/pages/Album";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          <Route path="ancestors" element={<AncestorsList />} />
          <Route path="ancestors/new" element={<AncestorForm mode="create" />} />
          <Route path="ancestors/:id" element={<AncestorDetail />} />
          <Route path="ancestors/:id/edit" element={<AncestorForm mode="edit" />} />
          
          <Route path="rituals" element={<RitualsList />} />
          <Route path="rituals/new" element={<RitualForm mode="create" />} />
          <Route path="rituals/:id/edit" element={<RitualForm mode="edit" />} />
          
          <Route path="reservations" element={<ReservationsList />} />
          <Route path="reservations/new" element={<ReservationForm mode="create" />} />
          <Route path="reservations/:id/edit" element={<ReservationForm mode="edit" />} />
          
          <Route path="timeline" element={<RitualTimeline />} />
          
          <Route path="family-tree" element={<FamilyTree />} />
          
          <Route path="members" element={<MembersList />} />
          
          <Route path="album" element={<Album />} />
          
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
