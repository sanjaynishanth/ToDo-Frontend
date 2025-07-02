import { useState } from 'react';
import { Search, Plus, CalendarDays } from 'lucide-react';
import AddTaskModal from './AddTaskModal';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl bg-[#F0FCFF] p-4 rounded-2xl shadow-lg font-[Poppins]">
        {/* Top: Search + Calendar + Add */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search Bar */}
          <div className="flex items-center gap-2 flex-1 bg-white border border-gray-300 px-3 py-1.5 rounded-full shadow-sm min-w-[240px]">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full outline-none font-medium text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendar((prev) => !prev)}
              className="p-2 rounded-full bg-[#C3F4FD] text-[#2B455C] hover:bg-[#A5EEFD] transition-all"
              title="Toggle calendar"
            >
              <CalendarDays className="w-5 h-5" />
            </button>

            <button
              className="flex items-center gap-2 bg-[#A5EEFD] text-[#2B455C] px-4 py-2 rounded-full font-semibold shadow hover:bg-[#C3F4FD] transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Optional: Floating Calendar */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-6 top-[90px] z-40 bg-white p-4 rounded-lg shadow-xl border border-gray-200"
            >
              {/* Replace with your calendar */}
              <p className="text-sm text-gray-500">📅 Calendar placeholder</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
};

export default Header;
