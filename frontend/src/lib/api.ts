import {
  isRangeResponse,
  type DayInput,
  type SchedulesRangeResponse,
  type SchedulesResponse,
  type TheatersResponse,
  type ValidationError,
} from './types';

/**
 * API base. In dev, Astro proxies /api to the Adonis backend (see astro.config.mjs).
 * In prod, set PUBLIC_API_BASE to the backend URL (or keep the proxy via a real server).
 */
const API_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) ?? '';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      throw new ApiError(
        res.status,
        `Request failed with status ${res.status}`,
        undefined,
      );
    }
    throw new ApiError(res.status, `Request failed`, body);
  }

  return (await res.json()) as T;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  vineErrors?: ValidationError['errors'];

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    if (body && typeof body === 'object' && 'errors' in body) {
      this.vineErrors = (body as ValidationError).errors;
    }
  }
}

/** GET /api/v1/theaters — instant, no Allocine fetch. */
export async function fetchTheaters(): Promise<TheatersResponse> {
  return fetchJson<TheatersResponse>(`${API_BASE}/api/v1/theaters`);
}

/** GET /api/v1/theater?days=N — single day. */
export async function fetchSchedule(day: number): Promise<SchedulesResponse> {
  const r = await fetchJson<SchedulesResponse>(
    `${API_BASE}/api/v1/theater?days=${day}`,
  );
  if (isRangeResponse(r)) {
    // Shouldn't happen for single-day input, but be defensive.
    return r.days[0];
  }
  return r;
}

/** GET /api/v1/theater?days=FROM-TO — range. */
export async function fetchScheduleRange(
  from: number,
  to: number,
): Promise<SchedulesRangeResponse> {
  const input: DayInput = `${from}-${to}`;
  const r = await fetchJson<SchedulesResponse | SchedulesRangeResponse>(
    `${API_BASE}/api/v1/theater?days=${input}`,
  );
  if (!isRangeResponse(r)) {
    // Backend returned single-day for a range request — wrap it.
    return { days: [r] };
  }
  return r;
}