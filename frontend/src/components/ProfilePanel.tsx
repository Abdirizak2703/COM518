import { FormEvent, useEffect, useState } from 'react';
import { MyTrip, UserProfile } from '../types';

interface ProfilePanelProps {
  profile: UserProfile | null;
  trips: MyTrip[];
  canEdit: boolean;
  onSave: (input: {
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
  }) => Promise<void>;
}

function formatTripDate(value: string): string {
  if (!/^\d{6}$/.test(value)) {
    return value;
  }

  const yy = value.slice(0, 2);
  const mm = value.slice(2, 4);
  const dd = value.slice(4, 6);
  return `20${yy}-${mm}-${dd}`;
}

export default function ProfilePanel({ profile, trips, canEdit, onSave }: ProfilePanelProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.fullName ?? '');
    setPhone(profile?.phone ?? '');
    setHomeCity(profile?.homeCity ?? '');
    setBio(profile?.bio ?? '');
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ fullName, phone, homeCity, bio });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2>Traveler Profile</h2>
      <p className="subtle">Save your booking details once and reuse them later.</p>
      <form onSubmit={(event) => void handleSubmit(event)} className="stack">
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={!canEdit}
          required
        />
        <input
          placeholder="Phone number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={!canEdit}
          required
        />
        <input
          placeholder="Home city"
          value={homeCity}
          onChange={(event) => setHomeCity(event.target.value)}
          disabled={!canEdit}
          required
        />
        <textarea
          placeholder="Short travel bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          disabled={!canEdit}
          required
        />
        <button type="submit" disabled={!canEdit || saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <section className="my-trips-block">
        <div className="panel-heading">
          <div>
            <h3>My Trips</h3>
            <p className="subtle">Your recent bookings are listed here.</p>
          </div>
        </div>
        {trips.length === 0 ? (
          <p className="subtle">No trips booked yet. Use the booking page to reserve your first stay.</p>
        ) : (
          <ul className="cards">
            {trips.map((trip) => (
              <li key={trip.bookingID} className="card my-trip-card">
                <div className="my-trip-topline">
                  <strong>{trip.accommodationName}</strong>
                  <span className="capacity-pill">{trip.units} unit(s)</span>
                </div>
                <p>{trip.accommodationType} in {trip.location}</p>
                <p className="subtle">Travel date: {formatTripDate(trip.date)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
