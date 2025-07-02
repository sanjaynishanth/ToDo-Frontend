import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
// import Dashboard from './pages/Dashboard'; 
import "./index.css"
import AllTasks from './pages/AllTasks';
import CompletedTasks from './pages/CompletedTask';
import Categories from './pages/Categories';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import {Navigate } from 'react-router-dom';

function App() {
  return (
    
    <Router>
      {/* <Sidebar/> */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/Login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/AllTasks" element={<AllTasks />} />
       
        <Route path="/completed" element={<CompletedTasks />} />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </Router>
  );
}

export default App;
