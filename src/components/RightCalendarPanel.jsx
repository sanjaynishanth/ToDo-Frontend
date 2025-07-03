import React, { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";

const RightCalendarPanel = ({ tasks }) => {
  // Initializing with null as per your provided code
  const [calendarDate, setCalendarDate] = useState(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

  const formatDate = (dateInput) => {
    if (!dateInput) return "No due date";
    const date = new Date(dateInput);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-gray-200 text-gray-700";
      case "in-progress":
        return "bg-blue-200 text-blue-700";
      case "completed":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Keep getPriorityBadgeClasses if you use it or plan to use it for task display
  // Otherwise, you can remove it if it's not applicable here.
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


  useEffect(() => {
    if (calendarDate) {
      const selectedDay = new Date(calendarDate);
      selectedDay.setHours(0, 0, 0, 0);

      const filtered = tasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === selectedDay.getTime();
      });

      setSelectedDateTasks(filtered);
    } else {
      setSelectedDateTasks([]);
    }
  }, [calendarDate, tasks]);

  return (
    <div className="hidden md:flex flex-col w-[410px] fixed right-0 top-0 h-screen bg-gray-100 shadow-inner p-4 overflow-y-auto z-40">
      <h3 className="text-md font-semibold text-[#2B455C] mb-2 text-center">📅 Calendar</h3>

      {/* PrimeReact Calendar - your existing structure */}
      <div className="card flex justify-center mb-4">
        <div className="scale-[0.9] origin-top">
          <Calendar
            value={calendarDate}
            onChange={(e) => setCalendarDate(e.value)}
            inline
            showWeek
          />
        </div>
      </div>

      {/* Tasks for selected date */}
      {calendarDate && (
        <>
          <h4 className="text-sm font-semibold text-[#2B455C] mb-2 text-center">
            🗂️ Tasks on {formatDate(calendarDate)}
          </h4>
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task) => (
                // *** START OF STYLING CHANGES FOR EACH TASK ITEM ***
                <div
                  key={task._id}
                  className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-400
                             flex items-center justify-between text-sm
                             transition-all duration-200 ease-in-out
                             hover:shadow-md hover:scale-[1.01] hover:bg-gray-50" // Added hover effects
                >
                  <div className="flex flex-col flex-grow mr-2">
                    <span className="font-semibold text-[#2B455C] text-base line-clamp-1">
                      {task.title}
                    </span>
                    {/* Optional: Add a subtle description if available and fits */}
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClasses(task.status)}`}
                    >
                      {task.status}
                    </span>
                    {/* Optional: Display priority if available for the task */}
                    {task.priority && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeClasses(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
                // *** END OF STYLING CHANGES FOR EACH TASK ITEM ***
              ))
            ) : (
              <p className="text-xs text-center text-gray-500 mt-2 p-2 bg-white rounded-lg shadow-sm">
                No tasks on this date.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RightCalendarPanel;
