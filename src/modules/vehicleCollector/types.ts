import { TMLApiVehicle } from "../../types/Vehicle";

export interface CollectorResponse {
  data: TMLApiVehicle[];
  error: string | null;
  generated_at: number;
  status_code: string;
  timestamp: number;
}

export interface CollectorStatus {
  is_fetching: boolean;
  last_success_at: number | null;
  last_error: string | null;
  vehicles_count: number;
}