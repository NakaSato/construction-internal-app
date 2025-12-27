import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useRole } from "../../shared/hooks/useAuth";

interface AppShellProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tabId: any) => void;
    title?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    activeTab,
    onTabChange,
    title = "Dashboard"
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { roleName } = useRole();
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                roleName={roleName || undefined}
            />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"
                    }`}
            >
                <Header
                    toggleSidebar={toggleSidebar}
                    title={title}
                />

                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};
