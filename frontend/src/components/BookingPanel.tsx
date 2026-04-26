import { FormEvent, useEffect, useState } from 'react';
import { Accommodation } from '../types';

interface BookingPanelProps {
  accommodation: Accommodation | null;
  onBook: (accID: number, yymmdd: string, npeople: number) => Promise<void>;
}

export default function BookingPanel({ accommodation, onBook }: BookingPanelProps) {
  const [date, setDate] = useState('');
  const [units, setUnits] = useState(1);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 29);
  const minDateValue = today.toISOString().slice(0, 10);
  const maxDateValue = maxDate.toISOString().slice(0, 10);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    setUnits(1);
  }, [accommodation]);

  if (!accommodation) {
    return (
      <section className="panel booking-panel">
        <div className="panel-heading">
          <div>
            <h2>Booking</h2>
            <p className="subtle">Choose a property from search results to continue.</p>
          </div>
        </div>
        <div className="booking-empty">
          <strong>No property selected</strong>
          <p>Go to Search, select a stay, and open its booking page.</p>
        </div>
      </section>
    );
  }

  const activeAccommodation = accommodation;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const yymmdd = date.split('-').map((part, index) => (index === 0 ? part.slice(2) : part)).join('');
    void onBook(activeAccommodation.id, yymmdd, units);
  }

  function increaseUnits(): void {
    setUnits((current) => Math.min(current + 1, activeAccommodation.roomsAvailableToday));
  }

  function decreaseUnits(): void {
    setUnits((current) => Math.max(1, current - 1));
  }

  return (
    <section className="panel booking-panel">
      <div className="panel-heading">
        <div>
          <h2>Booking Page</h2>
          <p className="subtle">Dedicated booking flow for {activeAccommodation.name}.</p>
        </div>
        <span className="capacity-pill">{activeAccommodation.roomsAvailableToday} rooms available</span>
      </div>
      <div className="booking-hero" style={{ backgroundImage: `url(${activeAccommodation.images[0]})` }}>
        <div className="booking-overlay">
          <strong>{activeAccommodation.name}</strong>
          <span>{activeAccommodation.type} in {activeAccommodation.location}</span>
        </div>
      </div>
      <p className="subtle booking-summary">
        Amenities: {activeAccommodation.amenities.join(' • ')}
      </p>
      <p className="subtle booking-summary">
        Facilities: {activeAccommodation.facilities.join(' • ')}
      </p>
      <form className="booking-form" onSubmit={handleSubmit}>
        <label className="booking-field">
          <span>Travel date</span>
          <input
            name="date"
            type="date"
            value={date}
            min={minDateValue}
            max={maxDateValue}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>
        <label className="booking-field">
          <span>Room units</span>
          <div className="unit-stepper" role="group" aria-label="Room units">
            <button type="button" className="secondary-button" onClick={decreaseUnits} disabled={units <= 1}>-</button>
            <input
              name="units"
              type="number"
              min={1}
              max={Math.max(1, activeAccommodation.roomsAvailableToday)}
              value={units}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                const safeValue = Number.isFinite(parsed) ? parsed : 1;
                const clamped = Math.min(Math.max(1, safeValue), Math.max(1, activeAccommodation.roomsAvailableToday));
                setUnits(clamped);
              }}
              required
            />
            <button
              type="button"
              className="secondary-button"
              onClick={increaseUnits}
              disabled={units >= Math.max(1, activeAccommodation.roomsAvailableToday)}
            >
              +
            </button>
          </div>
        </label>
        <button type="submit">Confirm Booking</button>
      </form>
      <p className="subtle booking-summary">You can book up to {activeAccommodation.roomsAvailableToday} room units for this property today.</p>
    </section>
  );
}
