import React from "react";
import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    Typography,
    Tooltip,
    Avatar,
} from "@mui/material";
import {
    LayoutDashboard,
    Briefcase,
    HardHat,
    CalendarDays,
    FileBarChart,
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useAuth, useRole } from "../../shared/hooks/useAuth";

const DRAWER_WIDTH_OPEN = 280;
const DRAWER_WIDTH_CLOSED = 72;

interface SidebarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    isOpen: boolean;
    toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    isOpen,
    toggleSidebar
}) => {
    const { logout } = useAuth();
    const { roleName } = useRole();

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
        <Drawer
            variant="permanent"
            sx={{
                width: isOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: isOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
                    boxSizing: "border-box",
                    transition: "width 0.3s ease",
                    overflowX: "hidden",
                    borderRight: "1px solid",
                    borderColor: "divider",
                },
            }}
        >
            {/* Brand Header */}
            <Box
                sx={{
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        background: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                    }}
                >
                    TC
                </Avatar>
                {isOpen && (
                    <Box sx={{ ml: 1.5 }}>
                        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: "bold" }}>
                            TaskCenter
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Project Management
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2, overflow: "auto" }}>
                <List disablePadding>
                    {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        const listItemButton = (
                            <ListItemButton
                                onClick={() => onTabChange(item.id)}
                                selected={isActive}
                                sx={{
                                    mx: 1,
                                    borderRadius: 2,
                                    mb: 0.5,
                                    minHeight: 48,
                                    justifyContent: isOpen ? "initial" : "center",
                                    px: isOpen ? 2 : 2.5,
                                    "&.Mui-selected": {
                                        backgroundColor: "primary.light",
                                        color: "primary.dark",
                                        "&:hover": {
                                            backgroundColor: "primary.light",
                                        },
                                        "& .MuiListItemIcon-root": {
                                            color: "primary.main",
                                        },
                                    },
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: isOpen ? 2 : "auto",
                                        justifyContent: "center",
                                        color: isActive ? "primary.main" : "text.secondary",
                                    }}
                                >
                                    <Icon size={22} />
                                </ListItemIcon>
                                {isOpen && (
                                    <ListItemText
                                        primary={item.label}
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    fontSize: "0.875rem",
                                                    fontWeight: isActive ? 600 : 500,
                                                },
                                            },
                                        }}
                                    />
                                )}
                                {isActive && isOpen && (
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            backgroundColor: "primary.main",
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        );

                        return (
                            <ListItem key={item.id} disablePadding sx={{ display: "block" }}>
                                {isOpen ? (
                                    listItemButton
                                ) : (
                                    <Tooltip title={item.label} placement="right" arrow>
                                        {listItemButton}
                                    </Tooltip>
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Footer / Logout */}
            <Divider />
            <Box sx={{ p: 1 }}>
                <Tooltip title={isOpen ? "" : "Sign Out"} placement="right" arrow>
                    <ListItemButton
                        onClick={logout}
                        sx={{
                            borderRadius: 2,
                            justifyContent: isOpen ? "initial" : "center",
                            px: isOpen ? 2 : 2.5,
                            "&:hover": {
                                backgroundColor: "error.light",
                                color: "error.main",
                                "& .MuiListItemIcon-root": {
                                    color: "error.main",
                                },
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: isOpen ? 2 : "auto",
                                justifyContent: "center",
                                color: "text.secondary",
                            }}
                        >
                            <LogOut size={22} />
                        </ListItemIcon>
                        {isOpen && (
                            <ListItemText
                                primary="Sign Out"
                                slotProps={{
                                    primary: {
                                        sx: {
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                        },
                                    },
                                }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
            </Box>

            {/* Collapse Toggle Button */}
            <IconButton
                onClick={toggleSidebar}
                sx={{
                    position: "absolute",
                    right: -16,
                    top: 80,
                    width: 32,
                    height: 32,
                    backgroundColor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    boxShadow: 2,
                    display: { xs: "none", lg: "flex" },
                    "&:hover": {
                        backgroundColor: "background.paper",
                        color: "primary.main",
                    },
                }}
            >
                {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </IconButton>
        </Drawer>
    );
};
