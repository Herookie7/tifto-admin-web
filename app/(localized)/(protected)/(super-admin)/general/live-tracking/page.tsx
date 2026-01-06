'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useQuery, gql } from '@apollo/client';
import { useConfiguration } from '@/lib/hooks/useConfiguration'; // Assumption: Helper for config
import { ProgressSpinner } from 'primereact/progressspinner';

const GET_ACTIVE_RIDERS = gql`
  query GetActiveRiders {
    getActiveRiders {
      _id
      name
      phone
      riderProfile {
         location {
             coordinates
         }
         available
         lastSeenAt
      }
    }
  }
`;

const containerStyle = {
    width: '100%',
    height: '600px'
};

const center = {
    lat: 28.6139, // Default: New Delhi
    lng: 77.2090
};

export default function LiveTrackingPage() {
    const { configuration } = useConfiguration(); // Fetch Google Maps Key
    const googleMapsApiKey = configuration?.googleMapsKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''; // Fallback

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey
    });

    const { data, startPolling, stopPolling } = useQuery(GET_ACTIVE_RIDERS, {
        pollInterval: 10000,
        fetchPolicy: 'network-only'
    });

    const [selectedRider, setSelectedRider] = useState(null);

    // If config not ready, waiting state
    if (!googleMapsApiKey) return <div>Loading Configuration...</div>;

    if (!isLoaded) return <div className="flex justify-center items-center h-screen"><ProgressSpinner /></div>;

    const riders = data?.getActiveRiders || [];

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Live Rider Tracking</h1>
            <div className="bg-white rounded-lg shadow-md p-2">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={riders[0]?.riderProfile?.location?.coordinates ? {
                        lat: riders[0].riderProfile.location.coordinates[1],
                        lng: riders[0].riderProfile.location.coordinates[0]
                    } : center}
                    zoom={12}
                >
                    {riders.map(rider => (
                        rider.riderProfile?.location?.coordinates && (
                            <Marker
                                key={rider._id}
                                position={{
                                    lat: rider.riderProfile.location.coordinates[1],
                                    lng: rider.riderProfile.location.coordinates[0]
                                }}
                                onClick={() => setSelectedRider(rider)}
                                icon={{
                                    url: "https://maps.google.com/mapfiles/ms/icons/motorcycling.png", // Or custom icon
                                    scaledSize: new google.maps.Size(40, 40)
                                }}
                            />
                        )
                    ))}

                    {selectedRider && (
                        <InfoWindow
                            position={{
                                lat: selectedRider.riderProfile.location.coordinates[1],
                                lng: selectedRider.riderProfile.location.coordinates[0]
                            }}
                            onCloseClick={() => setSelectedRider(null)}
                        >
                            <div className="p-2">
                                <h2 className="font-bold">{selectedRider.name}</h2>
                                <p>{selectedRider.phone}</p>
                                <p className={selectedRider.riderProfile.available ? "text-green-500" : "text-gray-500"}>
                                    {selectedRider.riderProfile.available ? "Available" : "Offline"}
                                </p>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>
            <div className="mt-4">
                <h2 className="text-xl font-semibold">Active Riders List</h2>
                <ul className="mt-2 space-y-2">
                    {riders.map(rider => (
                        <li key={rider._id} className="border p-2 rounded flex justify-between">
                            <span>{rider.name}</span>
                            <span className="text-sm text-gray-500">
                                Last Seen: {rider.riderProfile?.lastSeenAt ? new Date(rider.riderProfile.lastSeenAt).toLocaleTimeString() : 'N/A'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
