import React, { useState, useEffect } from "react";
import { Box, Backdrop, useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useRole } from "../../shared/hooks/useAuth";

const DRAWER_WIDTH_OPEN = 280;
const DRAWER_WIDTH_CLOSED = 72;

interface AppShellProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    title?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
    children,
    activeTab,
    onTabChange,
    title = "Dashboard"
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const { roleName } = useRole();

    // Handle responsive behavior
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",

                }}
            >
                <Header toggleSidebar={toggleSidebar} title={title} />

                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: "auto",
                        bgcolor: "grey.50",
                        p: { xs: 2, sm: 3, lg: 4 },
                    }}
                >
                    <Box sx={{ maxWidth: 1280, mx: "auto", height: "100%" }}>
                        {children}
                    </Box>
                </Box>
            </Box>

            {/* Mobile Overlay */}
            <Backdrop
                sx={{
                    zIndex: theme.zIndex.drawer - 1,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
                open={isMobile && sidebarOpen}
                onClick={() => setSidebarOpen(false)}
            />
        </Box>
    );
};
