import type { DestinationServiceItem } from "@/lib/types/destination";

const defaultHeaders = {
  "Content-Type": "application/json",
};
const credentials: RequestCredentials = "include";

/**
 * Fetches destination service list (categories and types).
 * GET /api-next/destination/serviceList
 */
export async function getServiceList(): Promise<Response> {
  return fetch("/api-next/destination/serviceList", {
    method: "GET",
    headers: defaultHeaders,
    credentials,
  });
}

/**
 * Fetches destination service level list.
 * GET /api-next/destination/levelList
 */
export async function getLevelList(): Promise<Response> {
  return fetch("/api-next/destination/levelList", {
    method: "GET",
    headers: defaultHeaders,
    credentials,
  });
}

/**
 * Updates existing destinations.
 * POST /api-next/destination/update
 * Body: array of destination update items.
 */
export async function updateDestination(body: unknown[]): Promise<Response> {
  return fetch("/api-next/destination/update", {
    method: "POST",
    headers: defaultHeaders,
    credentials,
    body: JSON.stringify(body),
  });
}

/**
 * Creates and/or updates destination services.
 * POST /api-next/destination/createService
 * Items with leadDestinationServiceId are updates; without it are inserts.
 */
export async function createService(
  items: DestinationServiceItem[]
): Promise<Response> {
  return fetch("/api-next/destination/createService", {
    method: "POST",
    headers: defaultHeaders,
    credentials,
    body: JSON.stringify(items),
  });
}
