"use client";

import { MapContainer, TileLayer, Marker, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet/hooks";
import type { GeoJsonObject } from "geojson";
import { useTractGeoJSON } from "@hooks/useMarketData";
import { useTheme } from "next-themes";

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
	._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapComponentProps {
	lat: number;
	lon: number;
	fips: { state: string; county: string; tract: string } | null;
	interactive?: boolean;
}

const MapUpdater: React.FC<{
	center: [number, number];
	geoJsonData?: GeoJsonObject | null;
}> = ({ center, geoJsonData }) => {
	const map = useMap();
	useEffect(() => {
		if (!map) return;
		if (geoJsonData) {
			const geoJsonLayer = L.geoJSON(geoJsonData);
			map.fitBounds(geoJsonLayer.getBounds());
		} else {
			map.setView(center, 14);
		}
	}, [map, center, geoJsonData]);
	return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
	lat,
	lon,
	fips,
	interactive = false,
}) => {
	const { resolvedTheme } = useTheme();
	const position: [number, number] = [lat, lon];
	const { data: geoJsonData } = useTractGeoJSON(fips);

	const tileUrl =
		resolvedTheme === "dark"
			? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
			: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

	const tileAttribution =
		resolvedTheme === "dark"
			? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
			: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

	return (
		<MapContainer
			center={position}
			zoom={14}
			style={{ height: "100%", width: "100%" }}
			scrollWheelZoom={interactive}
			dragging={interactive}
			zoomControl={interactive}
			doubleClickZoom={interactive}
			touchZoom={interactive}
			attributionControl={interactive}
		>
			<TileLayer
				key={resolvedTheme}
				attribution={tileAttribution}
				url={tileUrl}
			/>
			<Marker position={position} />
			{geoJsonData && (
				<GeoJSON
					data={geoJsonData as GeoJsonObject}
					style={{
						color: resolvedTheme === "dark" ? "#93c5fd" : "#3b82f6", // blue-300 dark, blue-500 light
						weight: 2,
						opacity: 0.7,
						fillOpacity: 0.2,
					}}
				/>
			)}
			<MapUpdater center={position} geoJsonData={geoJsonData} />
		</MapContainer>
	);
};

export default MapComponent;
