import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { Dashboard } from "./pages/Dashboard";
import { Plans } from "./pages/Plans";
import { PlanEditor } from "./pages/PlanEditor";
import { WorkoutSession } from "./pages/WorkoutSession";
import { DayWorkout } from "./pages/DayWorkout";
import { Nutrition } from "./pages/Nutrition";
import { WeightJournal } from "./pages/WeightJournal";
import { Settings } from "./pages/Settings";

function Shell() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/session/") || location.pathname.includes("/day/");

  return (
    <div className="app-shell" style={hideNav ? { paddingBottom: 0 } : undefined}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/plans/new" element={<PlanEditor />} />
        <Route path="/plans/:planId" element={<PlanEditor />} />
        <Route path="/plans/:planId/day/:dayId" element={<DayWorkout />} />
        <Route path="/session/:sessionId" element={<WorkoutSession />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/weight" element={<WeightJournal />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
