import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Pencil, // Added for edit icon
  Trash2, // Added for delete icon
  Share2, // Added for share icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // For modal animations
import { io } from 'socket.io-client'; // Ensure socket.io is imported

const ITEMS_PER_PAGE = 5;

const AllTasks = () => {
  const { token, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dueFilter, setDueFilter] = useState('');

  // States for Editing
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // States for Sharing
  const [shareTaskId, setShareTaskId] = useState(null);
  const [shareTo, setShareTo] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // --- API Calls & Socket.io ---
  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();

    // Socket.io for real-time updates
    const socket = io('http://localhost:5000');
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

  // --- Handlers for Task Actions ---

  // Handle toggling task completion status
  const handleToggleComplete = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    // Optimistic UI update
    setTasks(prevTasks => prevTasks.map(task =>
      task._id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert if API call fails
        setTasks(prevTasks => prevTasks.map(task =>
          task._id === taskId ? { ...task, status: currentStatus } : task
        ));
        console.error('Failed to toggle task status');
      }
    } catch (error) {
      // Revert if network error
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? { ...task, status: currentStatus } : task
      ));
      console.error('Error toggling task status:', error);
    }
  };

  // Function to initialize edit form when "Edit" button is clicked
  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status, // Added status
      priority: task.priority, // Added priority
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', // Added dueDate, formatted for input type="date"
    });
  };

  // Handle changes in the edit form inputs
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle submission of the edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${editingTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        // Socket.io might handle this update, but keeping client-side update for robustness
        const updatedTask = await res.json();
        setTasks(prevTasks => prevTasks.map(task => task._id === updatedTask._id ? updatedTask : task));
        setEditingTaskId(null); // Exit editing mode
        setEditForm({}); // Clear edit form state
      } else {
        console.error('Failed to update task:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Handle task deletion
  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Socket.io will handle updating the state, but explicit filter for robustness
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      } else {
        console.error('Failed to delete task:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Handle task sharing
  const handleShareTask = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${shareTaskId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emailOrUsername: shareTo }),
      });

      const data = await res.json();

      if (res.ok) {
        setShareMessage('✅ Task shared successfully!');
        // Re-fetch tasks to update sharedWith list if needed, or update optimistically
        fetchTasks(); // Re-fetch to ensure sharedWith list is updated
        setShareTo('');
      } else {
        setShareMessage(`❌ ${data.message || 'Failed to share task.'}`);
      }
    } catch (err) {
      console.error('Error sharing task:', err);
      setShareMessage('❌ Server error');
    }
  };

  // --- Filtering, Sorting, Pagination Logic ---
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;

    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchesDue =
      dueFilter === '' ||
      (dueFilter === 'today' && dueDate && dueDate.toDateString() === today.toDateString()) ||
      (dueFilter === 'overdue' && dueDate && dueDate < today);

    return matchesSearch && matchesStatus && matchesPriority && matchesDue;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0); // Treat no date as very old
    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  // --- Helper for Date Formatting ---
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen font-[Poppins] bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 mt-10 sm:mt-[10px]">
        <div className="max-w-full mx-auto">

          {/* Top Section */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-[#2B455C]">All Tasks</h2>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-300 rounded-full shadow-sm max-w-md w-full">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by title or description"
                className="w-full outline-none text-sm placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-full text-sm bg-[#D7F8FE] text-[#2B455C] border-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 rounded-full text-sm bg-[#D7F8FE] text-[#2B455C] border-none"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
              className="px-4 py-2 rounded-full text-sm bg-[#D7F8FE] text-[#2B455C] border-none"
            >
              <option value="">All Dates</option>
              <option value="today">Due Today</option>
              <option value="overdue">Overdue</option>
            </select>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1 text-sm text-[#2B455C] bg-[#E6FAFE] px-4 py-2 rounded-full hover:bg-[#C3F4FD]"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort by Due Date
            </button>
          </div>

          {/* Task Table */}
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-[#C3F4FD] text-[#2B455C] text-left text-sm">
                <tr>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Priority</th>
                  <th className="p-3 font-medium">Due Date</th>
                  <th className="p-3 font-medium text-center">Actions</th> {/* New column for actions */}
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {paginatedTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No tasks found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-b border-[#E6FAFE] hover:bg-[#F0FCFF] transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {/* Checkbox for Completion */}
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-green-500 cursor-pointer"
                            checked={task.status === 'completed'}
                            onChange={() => handleToggleComplete(task._id, task.status)}
                            title="Mark as Complete/Incomplete"
                          />
                          <span className={task.status === 'completed' ? 'line-through text-gray-400' : ''}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">{task.description || '—'}</td>
                      <td className="p-3 capitalize">{task.status}</td>
                      <td className="p-3 capitalize">{task.priority}</td>
                      <td className="p-3">
                        {formatDateForDisplay(task.dueDate)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-3">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(task)}
                            className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edit Task"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Share Button */}
                          <button
                            onClick={() => {
                              setShareTaskId(task._id);
                              setShowShareModal(true);
                              setShareMessage(''); // Clear previous message
                              setShareTo(''); // Clear previous recipient
                            }}
                            className="text-purple-500 hover:text-purple-600 p-1 rounded-full hover:bg-purple-50 transition-colors"
                            title="Share Task"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-[#F0FCFF] text-[#2B455C] disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-[#A5EEFD] text-[#2B455C]'
                    : 'bg-white text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-[#F0FCFF] text-[#2B455C] disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTaskId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/30  flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 font-[Poppins]">
              <h3 className="text-lg font-semibold text-[#2B455C]">Edit Task</h3>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <input
                  type="text"
                  name="title"
                  value={editForm.title || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 text-lg font-semibold"
                  placeholder="Task Title"
                  required
                />
                <textarea
                  name="description"
                  value={editForm.description || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 text-sm h-20 resize-y"
                  placeholder="Task Description (optional)"
                />
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Status Select */}
                  <select
                    name="status"
                    value={editForm.status || ''}
                    onChange={handleEditChange}
                    className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  {/* Priority Select */}
                  <select
                    name="priority"
                    value={editForm.priority || ''}
                    onChange={handleEditChange}
                    className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {/* Due Date Input */}
                  <input
                    type="date"
                    name="dueDate"
                    value={editForm.dueDate || ''}
                    onChange={handleEditChange}
                    className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTaskId(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Task Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/30  flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4 font-[Poppins]">
              <h3 className="text-lg font-semibold text-[#2B455C]">Share Task</h3>
              <input
                type="text"
                placeholder="Enter email or username"
                value={shareTo}
                onChange={(e) => setShareTo(e.target.value)}
                className="w-full border p-2 rounded text-sm"
              />
              {shareMessage && (
                <p className={`text-sm ${shareMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {shareMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="text-sm text-gray-500 hover:underline px-3 py-1 rounded"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareMessage('');
                    setShareTo('');
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareTask}
                  className="bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllTasks;
