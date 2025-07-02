import React, { useState, useContext } from 'react';
import {
    LogOut,
    LayoutDashboard,
    ListChecks,
    CheckSquare,
    Folder,
    Menu,
} from 'lucide-react';
import { FiChevronLeft } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ListChecks, label: 'View Task', path: '/AllTasks' },
    { icon: CheckSquare, label: 'Completed', path: '/completed' },
    { icon: Folder, label: 'Categories', path: '/categories' },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true); // Controls desktop sidebar width and label visibility
    const [mobileOpen, setMobileOpen] = useState(false); // Controls mobile sidebar visibility
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => setIsOpen((prev) => !prev);
    const showLabels = !mobileOpen && isOpen;

 

    return (
        <>
            {/* Font Import */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
        `}
            </style>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded shadow border"
                aria-label="Toggle Sidebar"
            >
                <Menu className="w-6 h-6 text-[#2B455C]" />
            </button>

            {/* Overlay for mobile (when sidebar is open) */}
            {mobileOpen && (
                <div
                    className="fixed inset-0  bg-opacity-50 z-20 md:hidden"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            {/* Sidebar Container */}
            <div
                className={`
    bg-[#F0FCFF] text-gray-800 h-screen p-4 flex flex-col justify-between
    transition-all duration-300 ease-in-out font-[Poppins] shadow-md
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    ${isOpen ? 'w-64' : 'w-20'} 
    fixed md:static z-30
    ${mobileOpen ? 'w-20' : ''}
  `}
            >
                {/* Top: Logo + Toggle */}
                <div>
                    <div className="flex justify-center mb-6">
                        <div
                            className={`flex items-center cursor-pointer ${showLabels ? 'justify-between w-full' : 'justify-center w-auto'
                                }`}
                            onClick={toggleSidebar}
                        >
                            {showLabels ? ( // Only show full logo and toggle arrow if labels are visible
                                <>
                                    <h1 className="text-2xl font-bold text-[#2B455C]">ToDo App</h1>
                                    <FiChevronLeft className="w-5 h-5 text-[#2B455C]" />
                                </>
                            ) : (
                                <div className="text-xl font-bold text-[#2B455C] bg-white w-10 h-10 flex items-center justify-center rounded-full shadow">
                                    T
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    {showLabels && ( // Only show user info if labels are visible
                        <div className="flex items-center gap-3 mb-8 p-2 bg-[#E0F8FF] rounded-lg shadow-sm">
                            <img
                                src={
                                    user?.picture ||
                                    `https://ui-avatars.com/api/?name=${user?.email || 'U'}&background=D7F8FE&color=2B455C`
                                }
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full border-2 border-[#D7F8FE] object-cover"
                            />
                            <div>
                                <p className="text-sm font-semibold text-[#2B455C]">
                                    {user?.email?.split('@')[0] || 'Guest'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    @{user?.email?.split('@')[0] || 'guest'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        {navItems.map(({ icon: Icon, label, path }) => {
                            const isActive = location.pathname === path;
                            return (
                                <button
                                    key={label}
                                    onClick={() => {
                                        navigate(path);
                                        setMobileOpen(false); // Close sidebar on navigation for mobile
                                    }}
                                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors focus:outline-none text-left ${isActive
                                        ? 'bg-[#C3F4FD] text-[#2B455C] font-semibold'
                                        : 'hover:bg-[#C3F4FD] text-[#2B455C]'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {showLabels && ( // Only show label if showLabels is true
                                        <span className="text-sm">{label}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}
                    className="flex items-center gap-3 text-sm text-red-500 hover:text-red-600 mt-6 p-3 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                    <LogOut className="w-5 h-5" />
                    {showLabels && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </>
    );
};

export default Sidebar;