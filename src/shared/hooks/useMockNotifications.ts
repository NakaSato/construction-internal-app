import { useCallback, useMemo, useState } from "react";

export type NotificationKind = "project" | "report" | "alert" | "system";

export interface AppNotification {
    id: string;
    kind: NotificationKind;
    title: string;
    body: string;
    /** Minutes ago the event happened — rendered as a relative label. */
    minutesAgo: number;
    read: boolean;
}

const SEED: AppNotification[] = [
    {
        id: "n1",
        kind: "project",
        title: "Rooftop Array — Phase 2 approved",
        body: "Site B installation cleared to start Monday.",
        minutesAgo: 4,
        read: false,
    },
    {
        id: "n2",
        kind: "report",
        title: "Daily report submitted",
        body: "Crew A logged 18 panels installed at Solar Farm North.",
        minutesAgo: 42,
        read: false,
    },
    {
        id: "n3",
        kind: "alert",
        title: "Inverter fault detected",
        body: "String 4 offline at Site C — maintenance notified.",
        minutesAgo: 96,
        read: false,
    },
    {
        id: "n4",
        kind: "system",
        title: "Weekly export ready",
        body: "Progress PDF for week 28 is available to download.",
        minutesAgo: 300,
        read: true,
    },
    {
        id: "n5",
        kind: "project",
        title: "Milestone reached",
        body: "Downtown Carport hit 75% completion.",
        minutesAgo: 1440,
        read: true,
    },
];

const relativeLabel = (minutesAgo: number): string => {
    if (minutesAgo < 1) return "just now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hours = Math.floor(minutesAgo / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

/**
 * Mock notification feed for the header bell. Purely client-side seed data —
 * swap for a real API/socket source when the backend is wired.
 */
export const useMockNotifications = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>(SEED);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const markRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const clearAll = useCallback(() => setNotifications([]), []);

    return { notifications, unreadCount, markAllRead, markRead, clearAll, relativeLabel };
};
