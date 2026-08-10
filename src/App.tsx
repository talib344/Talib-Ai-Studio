import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/landing/LandingPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ResearchPage from "./pages/ResearchPage";
import ScriptPage from "./pages/ScriptPage";
import ScenesPage from "./pages/ScenesPage";
import ImagePromptsPage from "./pages/ImagePromptsPage";
import AssetsPage from "./pages/AssetsPage";
import VoicePage from "./pages/VoicePage";
import VideoPage from "./pages/VideoPage";
import ThumbnailPage from "./pages/ThumbnailPage";
import SeoPage from "./pages/SeoPage";
import UploadPage from "./pages/UploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import ProjectsPage from "./pages/ProjectsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="script" element={<ScriptPage />} />
        <Route path="scenes" element={<ScenesPage />} />
        <Route path="image-generator" element={<ImagePromptsPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="voice" element={<VoicePage />} />
        <Route path="video" element={<VideoPage />} />
        <Route path="thumbnail" element={<ThumbnailPage />} />
        <Route path="seo" element={<SeoPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
