import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Shifts from './pages/Shifts';
import Leaves from './pages/Leaves';
import ShiftLog from './pages/ShiftLog';
import MonthlySummary from './pages/MonthlySummary';
import EmployeeDetail from './pages/EmployeeDetail';
import Reports from './pages/Reports';
import Projects from './pages/Projects';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/shift-log" element={<ShiftLog />} />
        <Route path="/monthly-summary" element={<MonthlySummary />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;