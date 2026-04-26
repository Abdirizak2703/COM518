import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAccommodationLocations, fetchAccommodationTypes } from '../api/client';

interface SearchPanelProps {
  onSearch: (location: string, type?: string) => Promise<void>;
}

export default function SearchPanel({ onSearch }: SearchPanelProps) {
  const [location, setLocation] = useState('Barcelona');
  const [type, setType] = useState('Hotel');
  const [loading, setLoading] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>(['Barcelona', 'Lisbon', 'Porto', 'Madrid']);
  const [typeOptions, setTypeOptions] = useState<string[]>(['Hotel', 'Apartment', 'Hostel', 'Resort', 'Villa']);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchShellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLocations() {
      try {
        const [locations, types] = await Promise.all([
          fetchAccommodationLocations(),
          fetchAccommodationTypes()
        ]);

        if (!isMounted) {
          return;
        }

        if (locations.length > 0) {
          setCityOptions(locations);
          const firstLocation = locations[0];
          if (firstLocation && !locations.includes(location)) {
            setLocation(firstLocation);
          }
        }

        if (types.length > 0) {
          setTypeOptions(types);
          const firstType = types[0];
          if (firstType && !types.includes(type)) {
            setType(firstType);
          }
        }
      } catch {
        // Keep the fallback list if the API is unavailable.
      }
    }

    void loadLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (!searchShellRef.current) {
        return;
      }

      if (!searchShellRef.current.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCities = useMemo(() => {
    const query = location.trim().toLowerCase();
    return cityOptions
      .filter((city) => (query.length === 0 ? true : city.toLowerCase().includes(query)))
      .slice(0, 8);
  }, [cityOptions, location]);

  const filteredTypes = useMemo(() => {
    const query = type.trim().toLowerCase();
    return typeOptions
      .filter((option) => (query.length === 0 ? true : option.toLowerCase().includes(query)))
      .slice(0, 8);
  }, [type, typeOptions]);

  function applySuggestion(field: 'location' | 'type', value: string): void {
    if (field === 'location') {
      setLocation(value);
    } else {
      setType(value);
    }

    setSuggestionsOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      setSuggestionsOpen(false);
      await onSearch(location, type || undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel panel-search">
      <div className="panel-heading">
        <div>
          <h2>Search Hotels</h2>
          <p className="subtle">Choose city and property type to get live rates, room availability, and map-ready results.</p>
        </div>
      </div>
      <div className="search-shell" ref={searchShellRef}>
        <form onSubmit={handleSubmit} className="search-grid">
          <input
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            placeholder="Location"
            required
            autoComplete="off"
          />
          <input
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            placeholder="Property type"
            autoComplete="off"
          />
          <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search Hotels'}</button>
        </form>

        {suggestionsOpen ? (
          <div className="search-dropdown panel" role="listbox" aria-label="Search suggestions">
            <div className="search-dropdown-group">
              <div className="search-dropdown-head">
                <span>Cities</span>
                <strong>{filteredCities.length}</strong>
              </div>
              <div className="search-dropdown-list">
                {filteredCities.length > 0 ? filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className="search-suggestion"
                    onClick={() => applySuggestion('location', city)}
                  >
                    <span className="search-suggestion-label">Location</span>
                    <strong>{city}</strong>
                  </button>
                )) : <p className="search-dropdown-empty">No matching cities.</p>}
              </div>
            </div>

            <div className="search-dropdown-group">
              <div className="search-dropdown-head">
                <span>Property Types</span>
                <strong>{filteredTypes.length}</strong>
              </div>
              <div className="search-dropdown-list">
                {filteredTypes.length > 0 ? filteredTypes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="search-suggestion"
                    onClick={() => applySuggestion('type', option)}
                  >
                    <span className="search-suggestion-label">Type</span>
                    <strong>{option}</strong>
                  </button>
                )) : <p className="search-dropdown-empty">No matching property types.</p>}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
