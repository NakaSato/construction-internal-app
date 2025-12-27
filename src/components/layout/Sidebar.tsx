import React from "react";
import {
    LayoutDashboard,
    Briefcase,
    HardHat,
    CalendarDays,
    FileBarChart,
    BarChart3,
    LogOut,
    Settings,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useAuth } from "../../shared/hooks/useAuth";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tabId: any) => void;
    isOpen: boolean;
    toggleSidebar: () => void;
    roleName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    isOpen,
    toggleSidebar,
    roleName
}) => {
    const { logout } = useAuth();

    const navigationItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "projects", label: "Projects", icon: Briefcase },
        { id: "construction", label: "Construction", icon: HardHat },
        { id: "planning", label: "Planning", icon: CalendarDays },
        { id: "reports", label: "Reports", icon: FileBarChart },
        { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["Admin", "Manager"] },
    ];

    const filteredItems = navigationItems.filter(
        item => !item.roles || (roleName && item.roles.includes(roleName))
    );

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300
                ${isOpen ? "w-64" : "w-20"}
                flex flex-col shadow-sm
            `}
        >
            {/* Brand Header */}
            {/* Brand Header */}
            <div className="h-16 flex items-center px-4 bg-white border-b border-gray-100">
                <div className="flex items-center space-x-3 text-blue-600">
                    {isOpen && (
                        <span className="font-bold text-xl tracking-tight text-slate-800">
                            TC
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            < div className="flex-1 py-6 overflow-y-auto" >
                <nav className="space-y-1 px-3">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`
                                    w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative mb-1
                                    ${isActive
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-slate-500 hover:bg-gray-50 hover:text-slate-900"
                                    }
                                `}
                            >
                                <Icon className={`h-5 w-5 ${isOpen ? "mr-3" : "mx-auto"} ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                                {isOpen && (
                                    <span className="text-sm">{item.label}</span>
                                )}

                                {!isOpen && (
                                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity shadow-lg">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div >

            {/* Footer / User / Logout */}
            < div className="p-4 border-t border-gray-100 bg-white" >
                <button
                    onClick={logout}
                    className={`
                        w-full flex items-center rounded-xl transition-colors text-slate-500 hover:bg-red-50 hover:text-red-600
                        ${isOpen ? "px-3 py-2" : "justify-center p-2"}
                    `}
                >
                    <LogOut className={`h-5 w-5 ${isOpen ? "mr-3" : ""}`} />
                    {isOpen && <span className="text-sm font-medium">Sign Out</span>}
                </button>
            </div >

            {/* Collapse Toggle Bubble */}
            < button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 bg-white border border-gray-200 text-slate-500 p-1.5 rounded-full shadow-sm hover:text-blue-600 transition-colors hidden lg:flex"
            >
                {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button >
        </aside >
    );
};
