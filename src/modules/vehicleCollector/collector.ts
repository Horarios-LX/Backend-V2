import path from "node:path";

import type {
    CollectorResponse,
    CollectorStatus
} from "./types.js";

const API_URL = "https://go.tmlmobilidade.pt/hub/api/v1/0XJC9/vehicles/positions"; // LA3SO - CMet | 0XJC9 - TML

const INTERVAL = Number(
    15_000
);

let latestData: CollectorResponse | null = null;

const status: CollectorStatus = {
    is_fetching: false,
    last_success_at: null,
    last_error: null,
    vehicles_count: 0
};

export async function collectVehicles(): Promise<CollectorResponse> {
    if (status.is_fetching) {
        throw new Error("A collection request is already running");
    }

    status.is_fetching = true;

    try {
        const response = await fetch(API_URL, {
            headers: {
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(15_000)
        });

        if (!response.ok) {
            throw new Error(`API returned HTTP ${response.status}`);
        }

        const data = await response.json() as CollectorResponse;

        if (
            !data ||
            !Array.isArray(data.data) ||
            !data.data.every(
                (vehicle) =>
                    vehicle &&
                    typeof vehicle.vehicle_id === "string"
            )
        ) {
            throw new Error("Invalid vehicleCollector response");
        }

        data.data = data.data.filter((vehicle) => vehicle.vehicle_id && (vehicle.agency_id === "LA77N" || vehicle.agency_id === "HF16N")); // filters all vehicles that aren't CMet/41

        latestData = data;

        status.last_success_at = Date.now();
        status.last_error = null;
        status.vehicles_count = data.data.length;

        console.log(`[vehicleCollector] Collected ${data.data.length} vehicles`);
        return data;
    } catch (error: any) {
        status.last_error = error.message;
        console.error("[vehicleCollector] Collection failed:", error.message);
        throw error;
    } finally {
        status.is_fetching = false;
    }
}

export function startVehicleCollector(onUpdate?: (data: CollectorResponse) => void | Promise<void>): () => void {
    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const run = async () => {
        if (stopped) return;
        try {
            const data = await collectVehicles();
            if (onUpdate) {
                try {
                    await onUpdate(data);
                } catch (error) {
                    console.error("[vehicleCollector] Update callback failed:", error);
                }
            }
        } catch {
            // Left empty
        }
    };

    void (async () => {
        if (!stopped) {
            await run();
            timer = setInterval(() => {
                void run();
            }, INTERVAL);
        }
    })();

    return () => {
        stopped = true;
        if (timer) {
            clearInterval(timer);
        }
    };
}

export function getLatestData(): CollectorResponse | null {
    return latestData;
}

export function getCollectorStatus(): CollectorStatus {
    return status;
}
