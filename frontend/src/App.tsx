import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboard Views
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import AICoach from './pages/dashboard/AICoach';
import Nutrition from './pages/dashboard/Nutrition';
import Workouts from './pages/dashboard/Workouts';
import KitchenAssistant from './pages/dashboard/KitchenAssistant';
import Health from './pages/dashboard/Health';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Site */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Private Dashboard Application Shell */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Overview />} />
          <Route path="ai-coach" element={<AICoach />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="kitchen" element={<KitchenAssistant />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="health" element={<Health />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
