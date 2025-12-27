import React from "react";
import { Search, Bell, User, Menu } from "lucide-react";
import { useAuth, useRole } from "../../shared/hooks/useAuth";

interface HeaderProps {
    toggleSidebar: () => void;
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
    const { user } = useAuth();
    const { roleName } = useRole();

    return (
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-8 z-40">
            {/* Left: Mobile Toggle & Title */}
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="mr-4 p-2 rounded-md hover:bg-gray-100 lg:hidden text-gray-600"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                    {title}
                </h1>
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                        placeholder="Search projects, tasks, or documents..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5">⌘K</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center space-x-3 lg:space-x-5">
                {/* Notifications */}
                <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                {/* Profile */}
                <div className="flex items-center space-x-3">
                    <div className="hidden text-right md:block">
                        <div className="text-sm font-semibold text-gray-700 leading-none">
                            {user?.fullName || user?.username || "Guest User"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 uppercase font-medium tracking-wide">
                            {roleName || "User"}
                        </div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white ring-2 ring-gray-100 shadow-sm cursor-pointer hover:ring-blue-100 transition-all">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
};
