import React from "react";
import {
    LayoutDashboard,
    Briefcase,
    HardHat,
    CalendarDays,
    FileBarChart,
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sun,
} from "lucide-react";
import { useAuth, useRole } from "../../shared/hooks/useAuth";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    isOpen: boolean;
    toggleSidebar: () => void;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "construction", label: "Construction", icon: HardHat },
    { id: "planning", label: "Planning", icon: CalendarDays },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["Admin", "Manager"] },
];

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    isOpen,
    toggleSidebar,
}) => {
    const { user, logout } = useAuth();
    const { roleName } = useRole();

    const items = NAV_ITEMS.filter(
        (item) => !item.roles || (roleName && item.roles.includes(roleName))
    );

    const displayName = user?.fullName || user?.username || "Guest";

    return (
        <aside
            className={[
                // Base: fixed overlay on mobile, in-flow rail on desktop
                "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300",
                "border-r border-slate-800 transition-all duration-300 ease-in-out",
                "lg:static lg:translate-x-0",
                // Width: full drawer on mobile, collapsible on desktop
                "w-[280px]",
                isOpen ? "translate-x-0 lg:w-[280px]" : "-translate-x-full lg:w-[76px]",
            ].join(" ")}
        >
            {/* Brand */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-900/40">
                    <Sun className="h-5 w-5 text-white" />
                </div>
                {isOpen && (
                    <div className="min-w-0 leading-tight">
                        <p className="truncate text-sm font-bold text-white">TaskCenter</p>
                        <p className="truncate text-xs text-slate-400">Project Management</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                {isOpen && (
                    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Menu
                    </p>
                )}
                <ul className="space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => onTabChange(item.id)}
                                    title={!isOpen ? item.label : undefined}
                                    aria-current={active ? "page" : undefined}
                                    className={[
                                        "group relative flex w-full items-center rounded-xl text-sm font-medium transition-colors",
                                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
                                        isOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5",
                                        active
                                            ? "bg-white/10 text-white"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white",
                                    ].join(" ")}
                                >
                                    {/* active accent bar */}
                                    <span
                                        className={[
                                            "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-400 transition-opacity",
                                            active ? "opacity-100" : "opacity-0",
                                        ].join(" ")}
                                    />
                                    <Icon
                                        className={[
                                            "h-[22px] w-[22px] flex-shrink-0 transition-colors",
                                            active ? "text-amber-400" : "text-slate-400 group-hover:text-white",
                                        ].join(" ")}
                                    />
                                    {isOpen && <span className="truncate">{item.label}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer: user + sign out */}
            <div className="border-t border-slate-800 p-3">
                {isOpen && (
                    <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                            {displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-medium text-white">{displayName}</p>
                            <p className="truncate text-xs uppercase tracking-wide text-slate-500">
                                {roleName || "User"}
                            </p>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    onClick={logout}
                    title={!isOpen ? "Sign Out" : undefined}
                    className={[
                        "flex w-full items-center rounded-xl text-sm font-medium text-slate-400 transition-colors",
                        "hover:bg-rose-500/10 hover:text-rose-400",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
                        isOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5",
                    ].join(" ")}
                >
                    <LogOut className="h-[22px] w-[22px] flex-shrink-0" />
                    {isOpen && <span>Sign Out</span>}
                </button>
            </div>

            {/* Desktop collapse toggle */}
            <button
                type="button"
                onClick={toggleSidebar}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-md transition-colors hover:border-amber-400/50 hover:text-amber-400 lg:flex"
            >
                {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
        </aside>
    );
};
