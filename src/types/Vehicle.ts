export interface FleetVehicle {
  id: string;
  operator: string;
  lastSeenAt: number | null;
  lastService: string | null;
  notes: string | null;
}

export interface TMLApiVehicle {
  _id: string;
  agency_id: string;

  bearing: number | null;
  bearing_method: string | null;

  calendar_date: string;
  created_at: number;
  received_at: number;

  current_status: string | null;
  direction_id: string | null;
  geohash: string | null;

  latitude: number;
  longitude: number;

  license_plate: string | null;
  operational_date: number;

  pattern_id: string | null;
  ride_id: string | null;
  route_id: string | null;
  route_short_name: string | null;
  shape_id: string | null;

  speed: number | null;
  stop_id: string | null;
  trip_id: string | null;
  vehicle_id: string;
  
  selected?: boolean;
}

export interface TMLCompressedApiVehicle {
  id: string;
  lat: number;
  lon: number;
  bearing: number | null;
  trip_id: string | null;
  timestamp: number;
  agency_id: string;
  selected?: boolean;
}