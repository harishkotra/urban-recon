import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PixelMapProps {
  onGuess: (lat: number, lng: number) => void;
  actualLocation?: { lat: number; lng: number };
  agentGuess?: { lat: number; lng: number };
  userGuess?: { lat: number; lng: number };
  showResults?: boolean;
}

const PixelMap: React.FC<PixelMapProps> = ({
  onGuess,
  actualLocation,
  agentGuess,
  userGuess,
  showResults,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const agentMarker = useRef<L.Marker | null>(null);
  const actualMarker = useRef<L.Marker | null>(null);
  const polylineUser = useRef<L.Polyline | null>(null);
  const polylineAgent = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current);

      mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
        if (showResults) return;
        const { lat, lng } = e.latlng;
        onGuess(lat, lng);

        if (userMarker.current) {
          userMarker.current.setLatLng([lat, lng]);
        } else {
          userMarker.current = L.marker([lat, lng], {
            icon: L.divIcon({
              className: "pixel-user-marker",
              html: '<div class="w-4 h-4 bg-blue-500 border-2 border-black"></div>',
            }),
          }).addTo(mapInstance.current!);
        }
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [onGuess, showResults]);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear previous markers/lines if not showing results
    if (!showResults) {
      if (agentMarker.current) agentMarker.current.remove();
      if (actualMarker.current) actualMarker.current.remove();
      if (polylineUser.current) polylineUser.current.remove();
      if (polylineAgent.current) polylineAgent.current.remove();
      agentMarker.current = null;
      actualMarker.current = null;
      polylineUser.current = null;
      polylineAgent.current = null;
      return;
    }

    // Show actual location
    if (actualLocation) {
      actualMarker.current = L.marker([actualLocation.lat, actualLocation.lng], {
        icon: L.divIcon({
          className: "pixel-actual-marker",
          html: '<div class="w-6 h-6 bg-green-500 border-2 border-black flex items-center justify-center text-[8px] font-pixel text-white">X</div>',
        }),
      }).addTo(mapInstance.current);
    }

    // Show agent guess
    if (agentGuess) {
      agentMarker.current = L.marker([agentGuess.lat, agentGuess.lng], {
        icon: L.divIcon({
          className: "pixel-agent-marker",
          html: '<div class="w-4 h-4 bg-red-500 border-2 border-black"></div>',
        }),
      }).addTo(mapInstance.current);

      if (actualLocation) {
        polylineAgent.current = L.polyline(
          [[agentGuess.lat, agentGuess.lng], [actualLocation.lat, actualLocation.lng]],
          { color: "red", weight: 2, dashArray: "5, 5" }
        ).addTo(mapInstance.current);
      }
    }

    // Show user guess line
    if (userGuess && actualLocation) {
      polylineUser.current = L.polyline(
        [[userGuess.lat, userGuess.lng], [actualLocation.lat, actualLocation.lng]],
        { color: "blue", weight: 2, dashArray: "5, 5" }
      ).addTo(mapInstance.current);
    }

    // Fit bounds to show everything
    const group = new L.FeatureGroup();
    if (userMarker.current) group.addLayer(userMarker.current);
    if (agentMarker.current) group.addLayer(agentMarker.current);
    if (actualMarker.current) group.addLayer(actualMarker.current);
    
    if (group.getLayers().length > 0) {
      mapInstance.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [showResults, actualLocation, agentGuess, userGuess]);

  return <div ref={mapRef} className="w-full h-full bg-[#333]" />;
};

export default PixelMap;
