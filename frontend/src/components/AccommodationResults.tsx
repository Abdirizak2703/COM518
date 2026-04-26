import { useEffect, useMemo, useState } from 'react';
import { Accommodation } from '../types';

interface AccommodationResultsProps {
  accommodations: Accommodation[];
  onSelectBooking: (accommodation: Accommodation) => void;
}

export function toYYMMDD(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return '';
  }

  return `${year.slice(2, 4)}${month}${day}`;
}

export default function AccommodationResults({ accommodations, onSelectBooking }: AccommodationResultsProps) {
  const resultsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [accommodations]);

  const totalPages = Math.max(1, Math.ceil(accommodations.length / resultsPerPage));

  const visibleAccommodations = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    return accommodations.slice(startIndex, startIndex + resultsPerPage);
  }, [accommodations, currentPage]);

  const firstResultNumber = accommodations.length === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1;
  const lastResultNumber = Math.min(currentPage * resultsPerPage, accommodations.length);

  function handlePreviousPage(): void {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function handleNextPage(): void {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  if (accommodations.length === 0) {
    return (
      <section className="panel panel-results-empty">
        <div className="panel-heading">
          <div>
            <h2>Results</h2>
            <p className="subtle">Search a location to load live properties, rooms, images, and amenities.</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-card">
            <span className="empty-kicker">Live data</span>
            <strong>Find a city to begin</strong>
            <p>Accommodation cards, map pins, and availability will appear here immediately.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel panel-results">
      <div className="panel-heading">
        <div>
          <h2>Results ({accommodations.length})</h2>
          <p className="subtle">Each property shows room availability, images, amenities, and facilities.</p>
        </div>
      </div>
      <div className="results-toolbar">
        <p className="results-range">Showing {firstResultNumber}-{lastResultNumber} of {accommodations.length}</p>
        <div className="results-pager" aria-label="Accommodation pagination">
          <button type="button" className="secondary-button pager-button" onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span className="pager-status">Page {currentPage} of {totalPages}</span>
          <button type="button" className="secondary-button pager-button" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
      <ul className="cards cards-rich">
        {visibleAccommodations.map((acc) => (
          <li key={acc.id} className="card card-rich">
            <div className="card-visual">
              <div
                className="property-image"
                style={{ backgroundImage: `url(${acc.images[0] ?? 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'})` }}
              >
                <span className="availability-badge">{acc.roomsAvailableToday} rooms available today</span>
              </div>
              <div className="thumbnail-row">
                {acc.images.slice(0, 3).map((image, index) => (
                  <span key={`${acc.id}-${index}`} className="thumbnail" style={{ backgroundImage: `url(${image})` }} />
                ))}
              </div>
            </div>

            <div className="card-body">
              <div className="card-topline">
                <div>
                  <h3>{acc.name}</h3>
                  <p>{acc.type} in {acc.location}</p>
                </div>
                <span className="capacity-pill">{acc.roomsTotal} total rooms</span>
              </div>

              <div className="detail-grid">
                <div>
                  <span className="detail-label">Amenities</span>
                  <div className="chip-row">
                    {acc.amenities.map((item) => <span key={item} className="chip">{item}</span>)}
                  </div>
                </div>
                <div>
                  <span className="detail-label">Facilities</span>
                  <div className="chip-row">
                    {acc.facilities.map((item) => <span key={item} className="chip chip-muted">{item}</span>)}
                  </div>
                </div>
              </div>

              <div className="book-grid book-grid-rich">
                <button type="button" className="secondary-button" onClick={() => onSelectBooking(acc)}>
                  View booking page
                </button>
                <span className="subtle booking-hint">Choose dates and traveler count on the dedicated booking page.</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
