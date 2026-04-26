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

export interface AccommodationDate {
  id: number;
  accID: number;
  thedate: string;
  availability: number;
}

export interface BookingInput {
  accID: number;
  date: string;
  npeople: number;
  apiID: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  admin: number;
  blocked: number;
  superAdmin: number;
}

export interface SessionUser {
  id: number;
  username: string;
  admin: boolean;
}

export interface UserProfile {
  userID: number;
  fullName: string;
  phone: string;
  homeCity: string;
  bio: string;
  updatedAt: string | null;
}

export interface BookingHistoryItem {
  bookingID: number;
  accID: number;
  accommodationName: string;
  accommodationType: string;
  location: string;
  date: string;
  units: number;
}
