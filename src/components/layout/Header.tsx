import React, { useEffect, useRef, useState } from "react";
import {
    Search,
    Bell,
    User,
    Menu,
    LogOut,
    Settings,
    Sparkles,
    FileText,
    AlertTriangle,
    Info,
    CheckCheck,
} from "lucide-react";
import { useAuth, useRole } from "../../shared/hooks/useAuth";
import {
    useMockNotifications,
    type NotificationKind,
} from "../../shared/hooks/useMockNotifications";

interface HeaderProps {
    toggleSidebar: () => void;
    title: string;
}

const KIND_META: Record<
    NotificationKind,
    { icon: React.ReactNode; ring: string }
> = {
    project: {
        icon: <Sparkles className="h-4 w-4" />,
        ring: "bg-blue-50 text-blue-600",
    },
    report: {
        icon: <FileText className="h-4 w-4" />,
        ring: "bg-emerald-50 text-emerald-600",
    },
    alert: {
        icon: <AlertTriangle className="h-4 w-4" />,
        ring: "bg-red-50 text-red-600",
    },
    system: {
        icon: <Info className="h-4 w-4" />,
        ring: "bg-gray-100 text-gray-500",
    },
};

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
    const { user, logout } = useAuth();
    const { roleName } = useRole();
    const {
        notifications,
        unreadCount,
        markAllRead,
        markRead,
        relativeLabel,
    } = useMockNotifications();

    const searchRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLDivElement>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);

    const displayName = user?.fullName || user?.username || "Guest User";

    // ⌘K / Ctrl+K focuses the global search.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Close popovers on outside click / Escape.
    useEffect(() => {
        if (!menuOpen && !bellOpen) return;
        const onClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false);
            if (bellRef.current && !bellRef.current.contains(t)) setBellOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                setBellOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen, bellOpen]);

    return (
        <header className="h-16 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-8 z-40">
            {/* Left: Mobile Toggle & Title */}
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                    className="mr-4 p-2 rounded-md hover:bg-gray-100 lg:hidden text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
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
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-slate-500 transition-colors" />
                    </div>
                    <label htmlFor="global-search" className="sr-only">
                        Search projects, tasks, or documents
                    </label>
                    <input
                        id="global-search"
                        ref={searchRef}
                        type="text"
                        className="block w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
                        placeholder="Search projects, tasks, or documents..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <kbd className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5 font-sans">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center space-x-3 lg:space-x-5">
                {/* Notifications */}
                <div className="relative" ref={bellRef}>
                    <button
                        onClick={() => setBellOpen((o) => !o)}
                        aria-haspopup="menu"
                        aria-expanded={bellOpen}
                        aria-label={
                            unreadCount > 0
                                ? `Notifications, ${unreadCount} unread`
                                : "Notifications"
                        }
                        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white ring-2 ring-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {bellOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-800">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-2 text-xs font-medium text-slate-500">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        <CheckCheck className="h-3.5 w-3.5" />
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-sm text-gray-400">
                                        You&apos;re all caught up
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const meta = KIND_META[n.kind];
                                        return (
                                            <button
                                                key={n.id}
                                                role="menuitem"
                                                onClick={() => markRead(n.id)}
                                                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${n.read ? "" : "bg-slate-50/60"
                                                    }`}
                                            >
                                                <span
                                                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${meta.ring}`}
                                                >
                                                    {meta.icon}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center justify-between gap-2">
                                                        <span className="truncate text-sm font-medium text-gray-800">
                                                            {n.title}
                                                        </span>
                                                        <span className="flex-shrink-0 text-[11px] text-gray-400">
                                                            {relativeLabel(n.minutesAgo)}
                                                        </span>
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-gray-500 line-clamp-2">
                                                        {n.body}
                                                    </span>
                                                </span>
                                                {!n.read && (
                                                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-slate-600" />
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                {/* Profile + dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-label="Open profile menu"
                        className="flex items-center space-x-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                    >
                        <div className="hidden text-right md:block">
                            <div className="text-sm font-semibold text-gray-700 leading-none">
                                {displayName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 uppercase font-medium tracking-wide">
                                {roleName || "User"}
                            </div>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white ring-2 ring-gray-100 shadow-sm hover:ring-slate-200 transition-all">
                            <User className="h-5 w-5" />
                        </div>
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 py-1 z-50"
                        >
                            <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                <div className="text-sm font-semibold text-gray-700 truncate">
                                    {displayName}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">
                                    {roleName || "User"}
                                </div>
                            </div>
                            <button
                                role="menuitem"
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Settings className="h-4 w-4 text-gray-400" />
                                Settings
                            </button>
                            <button
                                role="menuitem"
                                onClick={() => {
                                    setMenuOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
