import { Accommodation, AdminAccommodation, AdminClient, ApiFailure, MyTrip, SessionUser, UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {})
      }
    });
  } catch {
    const failure: ApiFailure = {
      status: 0,
      message: 'Unable to reach backend API. Confirm backend server is running and CORS is configured for your frontend port.'
    };
    throw failure;
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string; details?: string[] };
    const detailMessage = Array.isArray(payload.details) && payload.details.length > 0 ? payload.details.join(' ') : undefined;
    const failure: ApiFailure = {
      status: response.status,
      message: detailMessage ?? payload.error ?? 'Unknown API error.'
    };
    throw failure;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchSession(): Promise<SessionUser> {
  const response = await request<{ user: SessionUser }>('/session', { method: 'GET' });
  return response.user;
}

export async function login(username: string, password: string): Promise<SessionUser> {
  const response = await request<{ user: SessionUser }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  return response.user;
}

export async function registerUser(input: {
  username: string;
  password: string;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
}): Promise<string> {
  const response = await request<{ message: string }>('/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return response.message;
}

export async function forgotPassword(username: string, newPassword: string): Promise<string> {
  const response = await request<{ message: string }>('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ username, newPassword })
  });
  return response.message;
}

export async function logout(): Promise<void> {
  await request<void>('/logout', {
    method: 'POST'
  });
}

export async function searchAccommodations(location: string, type?: string): Promise<Accommodation[]> {
  const query = new URLSearchParams({ location: location.trim() });
  if (type && type.trim().length > 0) {
    query.set('type', type.trim());
  }

  const response = await request<{ data: Accommodation[] }>(`/accommodation?${query.toString()}`, {
    method: 'GET'
  });
  return response.data;
}

export async function fetchAccommodationLocations(): Promise<string[]> {
  const response = await request<{ data: string[] }>('/accommodation/locations', {
    method: 'GET'
  });
  return response.data;
}

export async function fetchAccommodationTypes(): Promise<string[]> {
  const response = await request<{ data: string[] }>('/accommodation/types', {
    method: 'GET'
  });
  return response.data;
}

export async function createBooking(input: {
  accID: number;
  date: string;
  npeople: number;
}): Promise<string> {
  const response = await request<{ message: string }>('/book', {
    method: 'POST',
    body: JSON.stringify({
      accID: input.accID,
      date: input.date,
      npeople: input.npeople,
      apiID: '0x574144'
    })
  });

  return response.message;
}

export async function fetchProfile(): Promise<UserProfile> {
  const response = await request<{ profile: UserProfile }>('/profile', {
    method: 'GET'
  });
  return response.profile;
}

export async function saveProfile(input: {
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
}): Promise<UserProfile> {
  const response = await request<{ profile: UserProfile }>('/profile', {
    method: 'PUT',
    body: JSON.stringify(input)
  });
  return response.profile;
}

export async function fetchMyTrips(): Promise<MyTrip[]> {
  const response = await request<{ trips: MyTrip[] }>('/profile/trips', {
    method: 'GET'
  });
  return response.trips;
}

export async function fetchAdminClients(): Promise<AdminClient[]> {
  const response = await request<{ clients: AdminClient[] }>('/admin/clients', {
    method: 'GET'
  });
  return response.clients;
}

export async function updateAdminClient(input: {
  userID: number;
  username: string;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
}): Promise<AdminClient> {
  const response = await request<{ client: AdminClient }>(`/admin/clients/${input.userID}`, {
    method: 'PUT',
    body: JSON.stringify({
      username: input.username,
      fullName: input.fullName,
      phone: input.phone,
      homeCity: input.homeCity,
      bio: input.bio
    })
  });

  return response.client;
}

export async function blockAdminClient(userID: number): Promise<AdminClient> {
  const response = await request<{ client: AdminClient }>(`/admin/clients/${userID}/block`, {
    method: 'PATCH'
  });
  return response.client;
}

export async function unblockAdminClient(userID: number): Promise<AdminClient> {
  const response = await request<{ client: AdminClient }>(`/admin/clients/${userID}/unblock`, {
    method: 'PATCH'
  });
  return response.client;
}

export async function deleteAdminClient(userID: number): Promise<void> {
  await request<void>(`/admin/clients/${userID}`, {
    method: 'DELETE'
  });
}

export async function fetchAdminAccommodations(): Promise<AdminAccommodation[]> {
  const response = await request<{ accommodations: AdminAccommodation[] }>('/admin/accommodations', {
    method: 'GET'
  });
  return response.accommodations;
}

export async function createAdminAccommodation(input: {
  name: string;
  type: string;
  location: string;
  roomsTotal: number;
  images: string[];
}): Promise<AdminAccommodation> {
  const response = await request<{ accommodation: AdminAccommodation }>('/admin/accommodations', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      type: input.type,
      location: input.location,
      roomsTotal: input.roomsTotal,
      images: input.images
    })
  });

  return response.accommodation;
}

export async function updateAdminAccommodation(input: {
  id: number;
  name: string;
  type: string;
  location: string;
  roomsTotal: number;
  images: string[];
}): Promise<AdminAccommodation> {
  const response = await request<{ accommodation: AdminAccommodation }>(`/admin/accommodations/${input.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: input.name,
      type: input.type,
      location: input.location,
      roomsTotal: input.roomsTotal,
      images: input.images
    })
  });

  return response.accommodation;
}

export async function deleteAdminAccommodation(id: number): Promise<void> {
  await request<void>(`/admin/accommodations/${id}`, {
    method: 'DELETE'
  });
}
