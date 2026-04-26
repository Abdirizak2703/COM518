export interface Accommodation {
  id: number;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  roomsTotal: number;
  roomsAvailableToday: number;
  amenities: string[];
  facilities: string[];
  images: string[];
}

export interface SessionUser {
  id: number;
  username: string;
  admin: boolean;
}

export interface ApiFailure {
  status: number;
  message: string;
}

export interface UserProfile {
  userID: number;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
  updatedAt: string | null;
}

export interface AdminClient {
  userID: number;
  username: string;
  admin: boolean;
  blocked: boolean;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
  updatedAt: string | null;
}

export interface AdminAccommodation {
  id: number;
  name: string;
  type: string;
  location: string;
  roomsTotal: number;
  images: string[];
}

export interface MyTrip {
  bookingID: number;
  accID: number;
  accommodationName: string;
  accommodationType: string;
  location: string;
  date: string;
  units: number;
}
