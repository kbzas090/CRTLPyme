'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';

interface TenantLocationMapProps {
  address: string;
  tenantName: string;
}

export default function TenantLocationMap({ address, tenantName }: TenantLocationMapProps) {
  // Encode address for URL
  const encodedAddress = encodeURIComponent(address);
  const googleMapsUrl = `https://www.google.com/maps?q=${encodedAddress}`;
  const embedUrl = `https://miro.medium.com/v2/resize:fit:1400/0*AAw6DtKQLDu6st4v.jpeg`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full h-[400px] rounded-lg overflow-hidden border">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ${tenantName}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{address}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(googleMapsUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver en Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
