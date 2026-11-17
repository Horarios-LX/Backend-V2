import { TMLApiVehicle } from "../../types/Vehicle";

export type VehicleFeedSocketT = {
    selectedVehicle: string | null;
    webSocket: WebSocket;
    transmitData(data: TMLApiVehicle[]): void;
    queryVehicle(vehicleId: string): void;
    setCompressed(compressed: boolean): void;
    setFocus(vehicleId: string | null, radius: number | null): void;
}