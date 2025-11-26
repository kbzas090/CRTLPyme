'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';

interface TenantLocationMapProps {
  address: string;
  tenantName: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

// Centro por defecto (Santiago, Chile)
const defaultCenter = {
  lat: -33.4489,
  lng: -70.6693,
};

export default function TenantLocationMap({ address, tenantName }: TenantLocationMapProps) {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Geocodificar dirección cuando el mapa esté cargado
  const geocodeAddress = useCallback(async () => {
    if (!address || !window.google || !mapLoaded) return;

    setIsGeocoding(true);
    setGeocodingError(null);

    const geocoder = new google.maps.Geocoder();
    
    try {
      geocoder.geocode({ address: `${address}, Chile` }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setMapCenter({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          setGeocodingError('No se pudo geocodificar la dirección');
          console.error('Geocoding failed:', status);
        }
        setIsGeocoding(false);
      });
    } catch (error) {
      setGeocodingError('Error al geocodificar');
      setIsGeocoding(false);
      console.error('Geocoding error:', error);
    }
  }, [address, mapLoaded]);

  // Ejecutar geocodificación cuando el mapa esté cargado
  useEffect(() => {
    if (mapLoaded) {
      geocodeAddress();
    }
  }, [mapLoaded, geocodeAddress]);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle>Ubicación</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
            <div className="text-center px-4">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Google Maps API Key no configurada</p>
              <p className="text-xs text-gray-500 mt-2">
                Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en las variables de entorno
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p>{address}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle>Ubicación</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver en Google Maps
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <LoadScript
          googleMapsApiKey={apiKey}
          onLoad={() => setMapLoaded(true)}
        >
          {isGeocoding ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Geocodificando dirección...</p>
              </div>
            </div>
          ) : geocodingError ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{geocodingError}</p>
                <p className="text-xs text-gray-500 mt-1">Dirección: {address}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={openInGoogleMaps}
                >
                  Ver en Google Maps
                </Button>
              </div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={15}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                zoomControl: true,
              }}
            >
              <Marker
                position={mapCenter}
                title={tenantName}
                onClick={() => setShowInfoWindow(true)}
              />
              
              {showInfoWindow && (
                <InfoWindow
                  position={mapCenter}
                  onCloseClick={() => setShowInfoWindow(false)}
                >
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{tenantName}</h3>
                    <p className="text-xs text-gray-600">{address}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </LoadScript>
        
        {/* Dirección debajo del mapa */}
        <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p>{address}</p>
        </div>
      </CardContent>
    </Card>
  );
}
