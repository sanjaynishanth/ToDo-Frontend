// AddTaskModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    onClose();
    setForm({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg font-[Poppins]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-[#2B455C] mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C3F4FD]"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows={3}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C3F4FD]"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border bg-[#F0FCFF] focus:outline-none focus:ring-2 focus:ring-[#C3F4FD]"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border bg-[#F0FCFF] focus:outline-none focus:ring-2 focus:ring-[#C3F4FD]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="col-span-full px-3 py-2 rounded-md border bg-[#F0FCFF] focus:outline-none focus:ring-2 focus:ring-[#C3F4FD]"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#A5EEFD] text-[#2B455C] font-semibold hover:bg-[#C3F4FD]"
                >
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;