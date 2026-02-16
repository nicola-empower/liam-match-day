import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LeftHandLayout } from './components/layout/LeftHandLayout';
import { MatchDayView } from './features/dashboard/MatchDayView';
import { HygieneTasks } from './features/routine/HygieneTasks';
import { TrainingSupplements } from './features/meds/TrainingSupplements';
import { AwayMatchRoute } from './features/travel/AwayMatchRoute';
import { RewardsView } from './features/rewards/RewardsView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeftHandLayout />}>
          <Route index element={<MatchDayView />} />
          <Route path="routine" element={<HygieneTasks />} />
          <Route path="travel" element={<AwayMatchRoute />} />
          <Route path="meds" element={<TrainingSupplements />} />
          <Route path="rewards" element={<RewardsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
