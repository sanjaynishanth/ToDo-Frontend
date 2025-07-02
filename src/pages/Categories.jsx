import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Categories = () => {
    const { token } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const res = await fetch('https://todo-backend-e14k.onrender.com/api/tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setTasks(data);
        }
        catch (err) {
            console.error('Failed to fetch tasks', err);
        }
    };

    useEffect(() => {
        if (token) fetchTasks();
    }, [token]);

    const priorities = ['high', 'medium', 'low'];

    return (
        <div className="flex h-screen font-[Poppins] bg-gray-100">
            <Sidebar />

            <div className="flex-1 overflow-y-auto p-6 mt-10 sm:mt-[10px]">
                <div className="max-w-full mx-auto">
                    <h2 className="text-2xl font-semibold text-[#2B455C] mb-6">
                        Tasks by Priority
                    </h2>

                    {tasks.length === 0 ? (
                        <p className="text-sm text-gray-500">No tasks available.</p>
                    ) : (
                        priorities.map((priority) => {
                            const filtered = tasks.filter((t) => t.priority === priority);
                            return (
                                <div key={priority} className="mb-10">
                                    <h3 className="text-lg font-medium text-[#2B455C] mb-2 capitalize">
                                        {priority} Priority
                                    </h3>

                                    {filtered.length === 0 ? (
                                        <p className="text-sm text-gray-500 mb-4">No {priority} priority tasks.</p>
                                    ) : (
                                        <div className="overflow-x-auto rounded-lg shadow-sm">
                                            <table className="w-full bg-white rounded-lg overflow-hidden mb-2">
                                                <thead className="bg-[#C3F4FD] text-[#2B455C] text-left text-sm">
                                                    <tr>
                                                        <th className="p-3 font-medium">Title</th>
                                                        <th className="p-3 font-medium">Description</th>
                                                        <th className="p-3 font-medium">Status</th>
                                                        <th className="p-3 font-medium">Due Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm text-gray-700">
                                                    {filtered.map((task) => (
                                                        <tr
                                                            key={task._id}
                                                            className="border-b border-[#E6FAFE] hover:bg-[#F0FCFF] transition"
                                                        >
                                                            <td className="p-3">{task.title}</td>
                                                            <td className="p-3">{task.description || '—'}</td>
                                                            <td className="p-3 capitalize">{task.status}</td>
                                                            <td className="p-3">
                                                                {task.dueDate
                                                                    ? new Date(task.dueDate).toLocaleDateString()
                                                                    : 'No due date'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Categories;
