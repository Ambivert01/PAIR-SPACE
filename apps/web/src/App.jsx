import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import OnboardingFlow from "./pages/OnboardingFlow.jsx";
import AuthRedirect from "./pages/AuthRedirect.jsx";
import InvitePartner from "./pages/InvitePartner.jsx";
import PendingInviteSent from "./pages/PendingInviteSent.jsx";
import PendingInviteReceived from "./pages/PendingInviteReceived.jsx";
import RelationshipHomeUltra from "./pages/RelationshipHomeUltra.jsx";
import RelationshipListPage from "./pages/RelationshipListPage.jsx";
import ChatPageUltra from "./pages/ChatPageUltra.jsx";
import TimelinePageUltra from "./pages/TimelinePageUltra.jsx";
import ActivityPageUltra from "./pages/ActivityPageUltra.jsx";
import PlannerPage from "./pages/PlannerPage.jsx";
import GamesPage from "./pages/GamesPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import PersonalizationPage from "./pages/PersonalizationPage.jsx";
import InsightsPage from "./pages/InsightsPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";
import JournalPageUltra from "./pages/JournalPageUltra.jsx";
import GiftGalleryUltra from "./pages/GiftGalleryUltra.jsx";
import TimeCapsulePageUltra from "./pages/TimeCapsulePageUltra.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppShell from "./components/AppShell.jsx";

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        {/* Landing page - public */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes - public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Onboarding - protected */}
        <Route
          path="/onboarding"
          element={
            <P>
              <OnboardingFlow />
            </P>
          }
        />

        {/* Main app routes - protected */}
        <Route
          element={
            <P>
              <AppShell />
            </P>
          }
        >
          <Route path="/app" element={<AuthRedirect />} />
          <Route path="/spaces" element={<RelationshipListPage />} />
          <Route path="/invite" element={<InvitePartner />} />
          <Route
            path="/relationship/pending-sent"
            element={<PendingInviteSent />}
          />
          <Route
            path="/relationship/pending-received"
            element={<PendingInviteReceived />}
          />
          <Route path="/relationship" element={<RelationshipHomeUltra />} />
          <Route path="/chat" element={<ChatPageUltra />} />
          <Route path="/memories" element={<TimelinePageUltra />} />
          <Route path="/activities" element={<ActivityPageUltra />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/personalize" element={<PersonalizationPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/journal" element={<JournalPageUltra />} />
          <Route path="/gifts" element={<GiftGalleryUltra />} />
          <Route path="/capsules" element={<TimeCapsulePageUltra />} />
        </Route>

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
