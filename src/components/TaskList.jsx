// TaskList.jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
    Pencil, // For editing
    Trash2, // For deleting
    // CheckCircle, // Not directly used as an icon for completion, but implied by checkbox
} from 'lucide-react';
import { Share2 } from 'lucide-react';

const TaskList = ({ token, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, dueFilter, setDueFilter }) => {
    const [tasks, setTasks] = useState([]);
    const [editingTaskId, setEditingTaskId] = useState(null); // Re-introduced
    const [editForm, setEditForm] = useState({}); // Re-introduced
    const [shareTaskId, setShareTaskId] = useState(null);
    const [shareTo, setShareTo] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);

    // --- Socket.io and Task Fetching (No changes, already good) ---
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/tasks', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setTasks(data);
            } catch (err) {
                console.error('Error fetching tasks:', err);
            }
        };

        if (token) fetchTasks();

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

    // --- Handlers for task actions ---

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
                // Optionally revert optimistic update if needed here
            }
        } catch (err) {
            console.error('Error updating task:', err);
            // Optionally revert optimistic update if needed here
        }
    };

    // Function to initialize edit form when "Edit" button is clicked
    const handleEditClick = (task) => {
        setEditingTaskId(task._id);
        setEditForm({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', // Format for input type="date"
        });
    };

    // Handle toggling task completion status
    const handleToggleComplete = async (taskId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        // Optimistic UI update
        setTasks(prevTasks => prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus } : task
        ));

        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'PUT', // Or PATCH depending on your API
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

    // --- Filtering Logic (No changes, already robust) ---
    const filteredTasks = tasks.filter((task) => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today for comparison

        const matchesDue =
            dueFilter === '' || // No due date filter
            (dueFilter === 'today' && dueDate && dueDate.toDateString() === today.toDateString()) ||
            (dueFilter === 'overdue' && dueDate && dueDate < today);

        return (
            (!statusFilter || task.status === statusFilter) &&
            (!priorityFilter || task.priority === priorityFilter) &&
            matchesDue
        );
    });

    // --- Helper Functions (Enhanced for new design) ---
    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options); // 'undefined' uses user's locale
    };

    const getDueDateStatusClasses = (dueDateString) => {
        if (!dueDateString) return '';
        const dueDate = new Date(dueDateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOverdue = dueDate < today;
        const isDueToday = dueDate.toDateString() === today.toDateString();

        if (isOverdue) return 'text-red-600 font-semibold'; // More prominent for overdue
        if (isDueToday) return 'text-orange-500 font-semibold'; // More prominent for due today
        return 'text-gray-500'; // Default for future dates
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
                setShareTo('');
            } else {
                setShareMessage(`❌ ${data.message}`);
            }
        } catch (err) {
            console.error('Error sharing task:', err);
            setShareMessage('❌ Server error');
        }
    };

    return (
        <div className="mt-50 px-4 md:px-8 font-[Poppins] pb-8">
            {filteredTasks.length === 0 ? (
                <div className="text-center text-gray-600 p-6 bg-white rounded-xl shadow-lg mt-8">
                    <p className="text-xl font-semibold">No tasks found</p>
                    <p className="mt-2 text-sm">Adjust your filters or add a new task.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {filteredTasks.map((task) => (
                        <div
                            key={task._id}
                            className={`
                bg-white shadow-lg rounded-xl p-6
                flex flex-col justify-between
                transition-all duration-300 ease-in-out
                hover:shadow-xl hover:scale-[1.02]
                border-l-4
                ${task.status === 'completed' ? 'border-green-500 opacity-85' : 'border-blue-400'}
              `}
                        >
                            {/* Conditional rendering: Show form if editing, else show task details */}
                            {editingTaskId === task._id ? (
                                // Task Edit Form
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
                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={editForm.dueDate || ''}
                                            onChange={handleEditChange}
                                            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            type="submit"
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingTaskId(null)}
                                            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // Task Display Mode
                                <>
                                    {/* Task Header: Checkbox, Title, and Actions */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-3 flex-grow">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                className="mt-1 w-5 h-5 accent-green-500 cursor-pointer focus:ring-green-400"
                                                checked={task.status === 'completed'}
                                                onChange={() => handleToggleComplete(task._id, task.status)}
                                            />
                                            {/* Title & Description */}
                                            <div className="flex-grow">
                                                <h2 className={`text-lg font-bold text-[#2B455C] leading-tight ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                                    {task.title}
                                                </h2>
                                                {task.description && (
                                                    <p className={`text-sm text-gray-700 mt-1 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons (Icons) */}
                                        <div className="flex flex-shrink-0 gap-2">
                                            <button
                                                onClick={() => handleEditClick(task)}
                                                className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                aria-label="Edit task"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                aria-label="Delete task"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShareTaskId(task._id);
                                                    setShowShareModal(true);
                                                    setShareMessage('');
                                                }}
                                                className="text-purple-500 hover:text-purple-600 p-1 rounded-full hover:bg-purple-50 transition-colors"
                                                aria-label="Share task"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Task Footer: Badges and Due Date */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClasses(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityBadgeClasses(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <p className={`font-medium ${getDueDateStatusClasses(task.dueDate)} text-right`}>
                                            Due: {formatDate(task.dueDate)}
                                        </p>
                                    </div>
                                    {/* Shared With (If Any) */}
                                    {task.sharedWith && task.sharedWith.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#2B455C]">
                                            <span className="font-semibold">Shared with:</span>
                                            {task.sharedWith.map((user) => (
                                                <span
                                                    key={user._id}
                                                    className="bg-[#E6FAFE] text-[#2B455C] px-2 py-1 rounded-full shadow-sm"
                                                >
                                                    @{user.username || user.email}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm space-y-4 font-[Poppins]">
                        <h3 className="text-lg font-semibold text-[#2B455C]">Share Task</h3>
                        <input
                            type="text"
                            placeholder="Enter email or username"
                            value={shareTo}
                            onChange={(e) => setShareTo(e.target.value)}
                            className="w-full border p-2 rounded text-sm"
                        />
                        {shareMessage && <p className="text-sm">{shareMessage}</p>}

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="text-sm text-gray-500 hover:underline"
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
                                className="bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TaskList;