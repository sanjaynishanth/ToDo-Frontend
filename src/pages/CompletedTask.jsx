import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const CompletedTasks = () => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  const fetchCompletedTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const completed = data.filter((task) => task.status === 'completed');
      setTasks(completed);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  useEffect(() => {
    if (token) fetchCompletedTasks();
  }, [token]);

  return (
    <div className="flex h-screen font-[Poppins] bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 mt-10 sm:mt-[10px]">
        <div className="max-w-full mx-auto">
          <h2 className="text-2xl font-semibold text-[#2B455C] mb-6">
            Completed Tasks
          </h2>

          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">No completed tasks found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-[#C3F4FD] text-[#2B455C] text-left text-sm">
                  <tr>
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Description</th>
                    <th className="p-3 font-medium">Priority</th>
                    <th className="p-3 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {tasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-b border-[#E6FAFE] hover:bg-[#F0FCFF] transition"
                    >
                      <td className="p-3 line-through">{task.title}</td>
                      <td className="p-3 line-through">
                        {task.description || '—'}
                      </td>
                      <td className="p-3 capitalize">{task.priority}</td>
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
      </div>
    </div>
  );
};

export default CompletedTasks;
