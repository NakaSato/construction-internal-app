import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin } from "lucide-react";
import { ProjectDto } from "../../shared/types/project";

interface ProjectMapProps {
    projects: ProjectDto[];
    height?: string | number;
}

// Component to handle map bounds update
const MapUpdater: React.FC<{ projects: ProjectDto[] }> = ({ projects }) => {
    const map = useMap();

    useEffect(() => {
        if (projects.length === 0) return;

        const bounds = L.latLngBounds([]);
        let hasValidCoords = false;

        projects.forEach((project) => {
            if (
                project.locationCoordinates &&
                project.locationCoordinates.latitude &&
                project.locationCoordinates.longitude
            ) {
                bounds.extend([
                    project.locationCoordinates.latitude,
                    project.locationCoordinates.longitude,
                ]);
                hasValidCoords = true;
            }
        });

        if (hasValidCoords) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
    }, [projects, map]);

    return null;
};

// Helper to get color based on status
const getStatusColor = (status: string | null) => {
    const normalizedStatus = status?.toLowerCase() || "";
    if (normalizedStatus.includes("progress")) return "text-emerald-600 bg-emerald-50 border-emerald-500";
    if (normalizedStatus.includes("plan")) return "text-blue-600 bg-blue-50 border-blue-500";
    if (normalizedStatus.includes("hold")) return "text-amber-600 bg-amber-50 border-amber-500";
    if (normalizedStatus.includes("complete")) return "text-indigo-600 bg-indigo-50 border-indigo-500";
    return "text-gray-600 bg-gray-50 border-gray-500";
};

// Create custom icon
const createCustomIcon = (status: string | null) => {
    const colorClass = getStatusColor(status);

    const iconMarkup = renderToStaticMarkup(
        <div className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 ${colorClass}`}>
            <MapPin size={16} fill="currentColor" className="opacity-90" />
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: "custom-map-marker", // Empty class to avoid default leaflet styles interfering too much
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

export const ProjectMap: React.FC<ProjectMapProps> = ({
    projects,
    height = "100%",
}) => {
    // Default center (Bangkok) if no projects
    const defaultPosition: [number, number] = [13.7563, 100.5018];

    return (
        <MapContainer
            center={defaultPosition}
            zoom={6}
            style={{ height: height, width: "100%", zIndex: 1 }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <MapUpdater projects={projects} />

            {projects.map((project) => {
                if (
                    !project.locationCoordinates ||
                    !project.locationCoordinates.latitude ||
                    !project.locationCoordinates.longitude
                ) {
                    return null;
                }

                return (
                    <Marker
                        key={project.projectId}
                        position={[
                            project.locationCoordinates.latitude,
                            project.locationCoordinates.longitude,
                        ]}
                        icon={createCustomIcon(project.status)}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong className="block mb-1 text-gray-900">{project.projectName}</strong>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${getStatusColor(project.status).split(' ')[1].replace('bg-', 'bg-').replace('50', '100')} ${getStatusColor(project.status).split(' ')[0]}`}>
                                    {project.status}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                    {project.locationCoordinates.latitude.toFixed(4)},{" "}
                                    {project.locationCoordinates.longitude.toFixed(4)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};
