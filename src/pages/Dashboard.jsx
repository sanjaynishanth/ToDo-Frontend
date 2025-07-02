// Updated Dashboard.jsx to support AddTaskModal through Header
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dueFilter, setDueFilter] = useState('');
  const [tasks, setTasks] = useState([]);

  const handleAddTask = async (form) => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}

      {/* Main content */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Header onAdd={handleAddTask}  />

        {/* Filters */}
        {/* <div className="p-4">
          <FilterBar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            dueFilter={dueFilter}
            setDueFilter={setDueFilter}
          />
        </div> */}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4">
          <TaskList
            token={token}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            dueFilter={dueFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;