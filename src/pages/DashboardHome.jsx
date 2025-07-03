import { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CalendarDays, Plus } from 'lucide-react';
import AddTaskModal from "../components/AddTaskModal";
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Calendar } from 'primereact/calendar';
import "primereact/resources/themes/lara-light-cyan/theme.css"; 
import "primereact/resources/primereact.min.css"; 
import RightCalendarPanel from '../components/RightCalendarPanel';

const DashboardHome = () => {
  const { token, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(null); 

  const handleAddTask = async (form) => {
    try {
      const res = await fetch('https://todo-backend-e14k.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [newTask, ...prev]);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('https://todo-backend-e14k.onrender.com/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    if (token) fetchTasks();

    const socket = io('https://todo-backend-e14k.onrender.com');
    socket.on('taskCreated', (task) => setTasks((prev) => [task, ...prev]));
    socket.on('taskUpdated', (updated) =>
      setTasks((prev) =>
        prev.map((task) => (task._id === updated._id ? updated : task))
      )
    );
    socket.on('taskDeleted', (taskId) =>
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
    );

    return () => socket.disconnect();
  }, [token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-700';
      case 'in-progress':
        return 'bg-blue-200 text-blue-700';
      case 'completed':
        return 'bg-green-200 text-green-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPriorityBadgeClasses = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-lime-200 text-lime-700';
      case 'medium':
        return 'bg-yellow-200 text-yellow-700';
      case 'high':
        return 'bg-red-200 text-red-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = filteredTasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.toDateString() === today.toDateString();
  });

  const upcomingTasks = filteredTasks
    .filter((t) => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // --- Task Counts and Percentages ---
  const totalTasksCount = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasksCount = filteredTasks.filter((t) => t.status === 'in-progress').length;
  const pendingTasksCount = filteredTasks.filter((t) => t.status === 'pending').length;

  const completionPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;
  const inProgressPercentage = totalTasksCount > 0 ? (inProgressTasksCount / totalTasksCount) * 100 : 0;
  const pendingPercentage = totalTasksCount > 0 ? (pendingTasksCount / totalTasksCount) * 100 : 0;

  const renderCircularProgress = (percentage, colorClass) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-gray-300"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="24"
            cy="24"
          />
          <motion.circle
            className={colorClass}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="24"
            cy="24"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1 }}
          />
        </svg>
        <span className="absolute text-xs font-semibold text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    );
  };

  // ----- UI START -----
  return (
    <div className="flex min-h-screen bg-gray-50 font-[Poppins]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Mobile-specific Greeting (appears above search bar on small screens) */}
        <h2 className="md:hidden text-xl sm:text-2xl font-semibold text-[#2B455C] text-center mt-6 px-4">
          👋 Back to work,{' '}
          <span className="capitalize">{user?.email?.split('@')[0] || 'User'}</span>!
        </h2>

        {/* Floating Header */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl bg-[#F0FCFF] p-3 md:p-4 mt-12 md:mt-0 rounded-2xl shadow-lg font-[Poppins]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 bg-white border border-gray-300 px-3 py-1.5 rounded-full shadow-sm w-full sm:w-auto">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full outline-none font-medium text-sm placeholder:text-gray-400"
              />
            </div>

            {/* Add Task Button Only */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                className="flex items-center gap-2 bg-[#A5EEFD] text-[#2B455C] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold shadow hover:bg-[#C3F4FD] transition-colors text-sm sm:text-base"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Section */}
        {/* Adjusted for mobile: increased padding-top, removed max-w-6xl for full width on small screens, smaller horizontal padding */}
        <div className="pt-[110px] md:pt-[110px] px- md:px-7 mx-auto space-y-8 pb-20 w-full sm:max-w-6xl">
          {/* Desktop-specific Greeting */}
          <h2 className="hidden md:block text-xl sm:text-2xl font-semibold text-[#2B455C] text-center md:text-left">
            👋 Back to work,{' '}
            <span className="capitalize">{user?.email?.split('@')[0] || 'User'}</span>!
          </h2>

          {/* Status Summary with Progress Circles */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 sm:gap-6 mt-4 md:mt-0"> {/* Added mt-4 for mobile */}
            <div className="px-5 py-3 sm:px-6 sm:py-4 rounded-xl shadow bg-white text-sm text-[#2B455C] w-full sm:w-auto flex items-center gap-3 sm:gap-4">
              {renderCircularProgress(completionPercentage, 'text-green-500')}
              <div>
                <p className="font-semibold">Completed</p>
                <p className="text-xl font-bold mt-1">{completedTasksCount}</p>
              </div>
            </div>
            <div className="px-5 py-3 sm:px-6 sm:py-4 rounded-xl shadow bg-white text-sm text-[#2B455C] w-full sm:w-auto flex items-center gap-3 sm:gap-4">
              {renderCircularProgress(inProgressPercentage, 'text-blue-500')}
              <div>
                <p className="font-semibold">In Progress</p>
                <p className="text-xl font-bold mt-1">{inProgressTasksCount}</p>
              </div>
            </div>
            <div className="px-5 py-3 sm:px-6 sm:py-4 rounded-xl shadow bg-white text-sm text-[#2B455C] w-full sm:w-auto flex items-center gap-3 sm:gap-4">
              {renderCircularProgress(pendingPercentage, 'text-red-500')}
              <div>
                <p className="font-semibold">Pending</p>
                <p className="text-xl font-bold mt-1">{pendingTasksCount}</p>
              </div>
            </div>
          </div>

          {/* Today's Projects */}
          <div className="space-y-3 sm:space-y-0">
            <h3 className="text-lg sm:text-xl font-semibold text-[#2B455C] mb-3">
              📅 Today's Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-4 rounded-lg shadow-md flex-shrink-0 space-y-2 border-l-4 border-blue-400"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-[#2B455C] line-clamp-1">
                      {task.title}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  <div className="flex gap-2 text-xs flex-wrap">
                    <span
                      className={`px-2 py-1 rounded-full ${getStatusBadgeClasses(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full ${getPriorityBadgeClasses(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.sharedWith?.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-semibold mb-1">Shared with:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {task.sharedWith.map((u, i) => (
                          <li key={i}>
                            {u.email?.split('@')[0] || 'User'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {todayTasks.length === 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md text-center col-span-full flex items-center justify-center">
                  <p className="text-sm text-gray-500">No tasks due today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Projects */}
          <div className="space-y-3 sm:space-y-0 max-w-3xl">
            <h3 className="text-lg sm:text-xl font-semibold text-[#2B455C] mb-3">
              🔜 Upcoming Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingTasks.slice(0, 2).map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-400"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-[#2B455C] line-clamp-1">
                      {task.title}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  <div className="flex gap-2 text-xs mt-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full ${getStatusBadgeClasses(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${getPriorityBadgeClasses(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.sharedWith?.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-semibold mb-1">Shared with:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {task.sharedWith.map((u, i) => (
                          <li key={i}>
                            {u.email?.split('@')[0] || 'User'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md text-center col-span-full flex items-center justify-center">
                  <p className="text-sm text-gray-500">No upcoming tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <RightCalendarPanel tasks={tasks} />



        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTask}
        />
      </div>
    </div>
  );
};

export default DashboardHome;
