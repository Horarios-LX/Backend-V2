import { TMLApiVehicle, TMLCompressedApiVehicle } from "../../types/Vehicle";
import { VehicleFeedSocketT } from "./types";

// values stolen from the "temporary" vehicle processor
const latRange = 111;
const lonRange = 76;

export class VehicleFeedSocket implements VehicleFeedSocketT {
    selectedVehicle: string | null;
    filteredRadius: number | null;
    webSocket: WebSocket;

    compressed: boolean = true;

    _lastReceivedData: TMLApiVehicle[] = [];

    constructor(webSocket: WebSocket) {
        this.selectedVehicle = null;
        this.filteredRadius = null;
        this.webSocket = webSocket;
    }

    queryVehicle(vehicleId: string) { // finds vehicle with specified vehicleId;
        let vec = this._lastReceivedData.find((vehicle) => vehicle.vehicle_id === vehicleId) || null;
        this.webSocket.send(JSON.stringify({
            type: 'vehicleInfo',
            data: vec ? COMPRESS_VEHICLE(vec as TMLApiVehicle) : null
        }));
    }

    setCompressed(compressed: boolean) {
        this.compressed = compressed;
    }

    setFocus(vehicleId: string | null, radius: number | null) {
        this.selectedVehicle = vehicleId;
        this.filteredRadius = radius;
        if(vehicleId !== null) this.transmitData(this._lastReceivedData);
    }

    transmitData(data: TMLApiVehicle[]) {
        this._lastReceivedData = data;
        let response: TMLApiVehicle[] | TMLCompressedApiVehicle[] = []
        if(this.selectedVehicle) {
            let vec = data.find((vehicle) => vehicle.vehicle_id === this.selectedVehicle) || null;
            response = data.filter((vehicle) => {
                return (
                    vec && (this.filteredRadius !== null && Math.abs(vehicle.latitude - vec.latitude) <= (this.filteredRadius / latRange) &&
                    Math.abs(vehicle.longitude - vec.longitude) <= (this.filteredRadius / lonRange)) || (this.filteredRadius === null && vehicle.vehicle_id === this.selectedVehicle)
                );
            });
            response = response.map(z => z === vec ? { selected: true, ...z} : z);
        } else {
            response = data;
        }
        if(this.compressed) {
            response = response.map(COMPRESS_VEHICLE);
        }

        if(this.webSocket.readyState === this.webSocket.OPEN) {
            this.webSocket.send(JSON.stringify({
                type: 'vehicleData',
                data: response
            }));
        }
    }
}

function COMPRESS_VEHICLE(vehicle: TMLApiVehicle): TMLCompressedApiVehicle {
    let res: TMLCompressedApiVehicle = {
        id: vehicle.vehicle_id,
        lat: vehicle.latitude,
        lon: vehicle.longitude,
        bearing: vehicle.bearing,
        trip_id: vehicle.trip_id,
        timestamp: vehicle.received_at,
        agency_id: vehicle.agency_id
    }
    if(vehicle.selected) res.selected = true;
    return res;
}