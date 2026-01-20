import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Zone } from '../../types';
import { getAQIColor } from '../../utils/aqiCalculations';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MumbaiMapProps {
  zones: Zone[];
  selectedZone: Zone | null;
  onZoneSelect: (zone: Zone) => void;
}

function MapUpdater({ selectedZone }: { selectedZone: Zone | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedZone) {
      map.setView([selectedZone.latitude, selectedZone.longitude], 13);
    }
  }, [selectedZone, map]);
  
  return null;
}

export default function MumbaiMap({ zones, selectedZone, onZoneSelect }: MumbaiMapProps) {
  const mumbaiCenter: [number, number] = [19.0760, 72.8777]; // Mumbai center coordinates
  // Mumbai bounds: Southwest and Northeast corners
  const mumbaiBounds: [[number, number], [number, number]] = [
    [18.8, 72.7],  // Southwest corner
    [19.4, 73.1]   // Northeast corner
  ];

  return (
    <MapContainer
      center={mumbaiCenter}
      zoom={11}
      minZoom={10}
      maxZoom={15}
      maxBounds={mumbaiBounds}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater selectedZone={selectedZone} />
      
      {zones.map((zone) => {
        const color = getAQIColor(zone.current_aqi);
        const isSelected = selectedZone?.id === zone.id;
        
        return (
          <CircleMarker
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={isSelected ? 18 : 12}
            pathOptions={{
              fillColor: color,
              color: '#fff',
              weight: isSelected ? 3 : 2,
              opacity: 1,
              fillOpacity: 0.8
            }}
            eventHandlers={{
              click: () => onZoneSelect(zone)
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{zone.name}</h3>
                <p className="text-sm">
                  <span className="font-semibold">AQI: </span>
                  <span className="font-bold" style={{ color }}>{zone.current_aqi}</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Baseline: {zone.baseline_aqi}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Click to view recommendations
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
