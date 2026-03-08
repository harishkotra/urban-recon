import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BlueprintMapProps {
    lat: number;
    lng: number;
    zoom: number;
    id: string;
}

const BlueprintMap: React.FC<BlueprintMapProps> = ({ lat, lng, zoom, id }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current, {
                center: [lat, lng],
                zoom: zoom,
                zoomControl: false,
                dragging: false,
                touchZoom: false,
                doubleClickZoom: false,
                scrollWheelZoom: false,
                boxZoom: false,
                keyboard: false,
                attributionControl: false
            });

            // Natural colors, no labels - CartoDB Voyager No Labels
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(leafletMap.current);
        } else {
            leafletMap.current.setView([lat, lng], zoom);
        }

        return () => {
            // We don't necessarily want to destroy the map every time if the ID is the same,
            // but if the component unmounts we should.
        };
    }, [lat, lng, zoom]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, []);

    return (
        <div
            id={id}
            ref={mapRef}
            className="w-full h-full bg-[#1a1a1a]"
        />
    );
};

export default BlueprintMap;
