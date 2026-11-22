
import type { FastifyPluginAsync } from "fastify";
import { VehicleFeedSocketT } from "./types";
import { VehicleFeedSocket } from "./socket";
import { TMLApiVehicle } from "../../types/Vehicle";
import tempCpTracker from "../tempCpTracker";

let connectedClients: Set<VehicleFeedSocketT> = new Set();

let _lastReceivedData: TMLApiVehicle[] = [];

const vehicleFeedRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.get("/feed", { websocket: true }, async (socket, request) => {
        const vehicleFeedSocket: VehicleFeedSocketT = new VehicleFeedSocket(socket);
        connectedClients.add(vehicleFeedSocket);

        vehicleFeedSocket.transmitData(_lastReceivedData);

        socket.on('message', (message: any) => {
            let data = JSON.parse(message.toString());
            switch (data.type) {
                case "vehicleQuery":
                    vehicleFeedSocket.queryVehicle(data.value);
                    break;
                case "vehicleFocus":
                    vehicleFeedSocket.setFocus(data.value.vehicleId, data.value.radius);
                    break;
                case "vehicleUnfocus":
                    vehicleFeedSocket.setFocus(null, null);
                    break;
            }
        });

        socket.on('close', () => {
            connectedClients.delete(vehicleFeedSocket);
        });
    });


};

const vehicleFeedData = (data: TMLApiVehicle[]) => {
    //_lastReceivedData = data; // instead of overriding data, we'll keep old vehicles in the feed in case we need them but they stopped running. Front-end SHOULD filter out old vehicles (from their timestamp) if necessary
    _lastReceivedData = [...new Map([..._lastReceivedData, ...data].map(v => [v.vehicle_id, v])).values()]; //reuse this for fleet?
    connectedClients.forEach((client) => {
        client.transmitData(_lastReceivedData);
    });
};

export default {
    ROUTES: vehicleFeedRoutes,
    ON_DATA: vehicleFeedData,

    start: () => {
        //console.log("[vehicleFeed] Starting feed...");
    },

    stop: () => {
        //console.log("[vehicleCollector] Stopping collector...");
    },

    cleanup: () => {
        tempCpTracker.cleanup();
    }
};