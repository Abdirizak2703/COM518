import { useEffect, useMemo, useState } from 'react';
import {
  blockAdminClient,
  createAdminAccommodation,
  createBooking,
  deleteAdminAccommodation,
  deleteAdminClient,
  fetchAdminAccommodations,
  fetchAdminClients,
  fetchMyTrips,
  fetchProfile,
  fetchSession,
  forgotPassword,
  login,
  logout,
  registerUser,
  saveProfile,
  searchAccommodations,
  unblockAdminClient,
  updateAdminAccommodation,
  updateAdminClient
} from './api/client';
import AccommodationResults from './components/AccommodationResults';
import AdminPanel from './components/AdminPanel';
import BookingPanel from './components/BookingPanel';
import HeaderNav from './components/HeaderNav';
import LeafletMap from './components/LeafletMap';
import LoginPanel from './components/LoginPanel';
import ProfilePanel from './components/ProfilePanel';
import SearchPanel from './components/SearchPanel';
import { DestinationsSection, FeaturesSection, OffersSection } from './components/SectionBlocks';
import { Accommodation, AdminAccommodation, AdminClient, ApiFailure, MyTrip, SessionUser, UserProfile } from './types';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

type ThemeMode = 'dark' | 'light';

function mapErrorToMessage(error: unknown): string {
  const fallback = 'Something went wrong. Please try again.';
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const maybeFailure = error as ApiFailure;
  if (!maybeFailure.status) {
    return fallback;
  }

  if (maybeFailure.status === 400) {
    return `Invalid input: ${maybeFailure.message}`;
  }
  if (maybeFailure.status === 401) {
    return 'Unauthorized. Please Register in to continue.';
  }
  if (maybeFailure.status === 404) {
    return maybeFailure.message || 'No matching records found.';
  }
  if (maybeFailure.status === 409) {
    return 'No availability for the selected date or party size.';
  }

  return maybeFailure.message || fallback;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const savedTheme = window.localStorage.getItem('pts-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myTrips, setMyTrips] = useState<MyTrip[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [adminClients, setAdminClients] = useState<AdminClient[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminAccommodations, setAdminAccommodations] = useState<AdminAccommodation[]>([]);
  const [searchState, setSearchState] = useState<{ location: string; type: string | undefined } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('Welcome to PlacesToStay. Search for your next stay.');
  const [error, setError] = useState<string>('');

  async function loadProfile(): Promise<void> {
    try {
      const data = await fetchProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }

  async function loadMyTrips(): Promise<void> {
    if (!user) {
      setMyTrips([]);
      return;
    }

    try {
      const trips = await fetchMyTrips();
      setMyTrips(trips);
    } catch {
      setMyTrips([]);
    }
  }

  async function refreshSearch(location: string, type?: string, silent = false): Promise<void> {
    try {
      const data = await searchAccommodations(location, type);
      setAccommodations(data);
      setLastUpdated(new Date().toLocaleTimeString());
      if (selectedAccommodation) {
        const refreshedSelection = data.find((item) => item.id === selectedAccommodation.id) ?? null;
        setSelectedAccommodation(refreshedSelection);
      }
      if (!silent) {
        setError('');
        setFeedback(`Loaded ${data.length} accommodation(s).`);
      }
    } catch (err) {
      if (!silent) {
        setAccommodations([]);
        setError(mapErrorToMessage(err));
      }
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('pts-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function loadSession() {
      try {
        const sessionUser = await fetchSession();
        setUser(sessionUser);
        await loadProfile();
        const trips = await fetchMyTrips();
        setMyTrips(trips);
      } catch {
        setUser(null);
        setProfile(null);
        setMyTrips([]);
      }
    }

    void loadSession();
  }, []);

  useEffect(() => {
    if (!searchState) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void refreshSearch(searchState.location, searchState.type, true);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [searchState, selectedAccommodation]);

  useEffect(() => {
    if (location.pathname !== '/profile' || user) {
      return;
    }

    setAuthOpen(true);
    setFeedback('Please log in to open your profile section.');
    navigate('/search', { replace: true });
  }, [location.pathname, navigate, user]);

  useEffect(() => {
    if (location.pathname !== '/admin') {
      return;
    }

    if (!user) {
      setAuthOpen(true);
      setFeedback('Please log in with an admin account to open admin panel.');
      navigate('/search', { replace: true });
      return;
    }

    if (!user.admin) {
      setFeedback('Admin access is required for this section.');
      navigate('/search', { replace: true });
      return;
    }

    if ((adminClients.length === 0 || adminAccommodations.length === 0) && !adminLoading) {
      void loadAdminClients();
      void loadAdminAccommodations();
    }
  }, [adminAccommodations.length, adminClients.length, adminLoading, location.pathname, navigate, user]);

  async function handleLogin(username: string, password: string): Promise<void> {
    try {
      const loggedUser = await login(username, password);
      setUser(loggedUser);
      await loadProfile();
      const trips = await fetchMyTrips();
      setMyTrips(trips);
      if (loggedUser.admin) {
        void loadAdminClients();
        void loadAdminAccommodations();
      }
      setAuthOpen(false);
      setError('');
      setFeedback(`Logged in as ${loggedUser.username}.`);
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleRegister(input: {
    username: string;
    password: string;
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
  }): Promise<void> {
    try {
      const message = await registerUser(input);
      const loggedUser = await login(input.username, input.password);
      setUser(loggedUser);
      await loadProfile();
      const trips = await fetchMyTrips();
      setMyTrips(trips);
      setAuthOpen(false);
      setError('');
      setFeedback(message);
      navigate('/profile');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleForgotPassword(username: string, newPassword: string): Promise<void> {
    try {
      const message = await forgotPassword(username, newPassword);
      setError('');
      setFeedback(message);
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function loadAdminClients(): Promise<void> {
    setAdminLoading(true);
    try {
      const clients = await fetchAdminClients();
      setAdminClients(clients);
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    } finally {
      setAdminLoading(false);
    }
  }

  async function loadAdminAccommodations(): Promise<void> {
    setAdminLoading(true);
    try {
      const accommodations = await fetchAdminAccommodations();
      setAdminAccommodations(accommodations);
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleSearch(location: string, type?: string): Promise<void> {
    setSearchState({ location, type });
    navigate('/search');
    await refreshSearch(location, type);
  }

  async function handleBook(accID: number, date: string, npeople: number): Promise<void> {
    try {
      const message = await createBooking({ accID, date, npeople });
      setError('');
      setFeedback(message);
      if (searchState) {
        await refreshSearch(searchState.location, searchState.type, true);
      }
      await loadMyTrips();
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await logout();
      setUser(null);
      setProfile(null);
      setMyTrips([]);
      setAdminClients([]);
      setAdminAccommodations([]);
      setAuthOpen(false);
      setError('');
      setFeedback('Logged out successfully.');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleSaveProfile(input: {
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
  }): Promise<void> {
    try {
      const updated = await saveProfile(input);
      setProfile(updated);
      setError('');
      setFeedback('Profile updated successfully.');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleAdminSave(input: {
    userID: number;
    username: string;
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
  }): Promise<void> {
    try {
      const updatedClient = await updateAdminClient(input);
      setAdminClients((currentClients) => currentClients.map((client) => (
        client.userID === updatedClient.userID ? updatedClient : client
      )));
      setError('');
      setFeedback(`Updated client ${updatedClient.username}.`);
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleAdminBlock(userID: number): Promise<void> {
    try {
      const updated = await blockAdminClient(userID);
      setAdminClients((current) => current.map((client) => (client.userID === updated.userID ? updated : client)));
      setFeedback(`Blocked ${updated.username}.`);
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleAdminUnblock(userID: number): Promise<void> {
    try {
      const updated = await unblockAdminClient(userID);
      setAdminClients((current) => current.map((client) => (client.userID === updated.userID ? updated : client)));
      setFeedback(`Unblocked ${updated.username}.`);
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleAdminDeleteClient(userID: number): Promise<void> {
    try {
      await deleteAdminClient(userID);
      setAdminClients((current) => current.filter((client) => client.userID !== userID));
      setFeedback('Client deleted successfully.');
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleAdminAccommodationSave(input: {
    id: number;
    name: string;
    type: string;
    location: string;
    roomsTotal: number;
    images: string[];
  }): Promise<void> {
    try {
      const updated = await updateAdminAccommodation(input);
      setAdminAccommodations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setFeedback(`Accommodation ${updated.name} updated.`);
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleAdminAccommodationDelete(id: number): Promise<void> {
    try {
      await deleteAdminAccommodation(id);
      setAdminAccommodations((current) => current.filter((item) => item.id !== id));
      setFeedback('Accommodation deleted successfully.');
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  async function handleAdminAccommodationCreate(input: {
    name: string;
    type: string;
    location: string;
    roomsTotal: number;
    images: string[];
  }): Promise<void> {
    try {
      const created = await createAdminAccommodation(input);
      setAdminAccommodations((current) => [created, ...current]);
      setFeedback(`Accommodation ${created.name} created.`);
      setError('');
    } catch (err) {
      setError(mapErrorToMessage(err));
    }
  }

  function openBooking(accommodation: Accommodation): void {
    setSelectedAccommodation(accommodation);
    navigate('/booking');
    setFeedback(`Booking page opened for ${accommodation.name}.`);
    setError('');
  }

  const searchSummary = useMemo(() => {
    if (!searchState) {
      return 'Search to load live inventory, room counts, and map pins.';
    }

    return `Searching ${searchState.location}${searchState.type ? ` · ${searchState.type}` : ''}`;
  }, [searchState]);

  const isHome = location.pathname === '/';

  function handleToggleTheme(): void {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }

  return (
    <main className="layout app-shell">
      <HeaderNav
        loggedInUsername={user?.username ?? ''}
        isAdmin={Boolean(user?.admin)}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {isHome ? (
        <>
          <section className="hero panel hero-landing">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="eyebrow">Travel platform experience</span>
                <h1>Hotels, homes, and instant booking confidence</h1>
                <p>Discover destination stays with live rooms, rich property details, and a streamlined flow from search to booking and traveler profile.</p>
                <div className="hero-actions">
                  <button type="button" onClick={() => navigate('/search')}>Search Hotels</button>
                  <button type="button" className="secondary-button" onClick={() => navigate('/offers')}>View Deals</button>
                  <button type="button" className="secondary-button" onClick={() => navigate('/booking')}>Booking Desk</button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      if (user) {
                        navigate('/profile');
                        return;
                      }

                      setAuthOpen(true);
                      setFeedback('Please log in to open your profile section.');
                    }}
                  >
                    Traveler Profile
                  </button>
                </div>
              </div>

              <div className="hero-snapshot">
                <div className="snapshot-card">
                  <span>Live rooms now</span>
                  <strong>{accommodations.length ? `${accommodations.reduce((total, item) => total + item.roomsAvailableToday, 0)} available tonight` : 'Search to reveal live inventory'}</strong>
                </div>
                <div className="snapshot-card accent">
                  <span>Session status</span>
                  <strong>{user ? `${user.username} saved in session` : 'Login from the header'}</strong>
                </div>
                <div className="snapshot-card">
                  <span>Current booking context</span>
                  <strong>{selectedAccommodation ? selectedAccommodation.name : 'Pick a property to continue'}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="panel utility-strip">
            <div><strong>Free cancellation on select stays</strong><span>Book now with flexible travel plans.</span></div>
            <div><strong>Verified properties</strong><span>Rich metadata with amenities and facilities included.</span></div>
            <div><strong>Session-secure checkout</strong><span>Login and profile data stay tied to your account.</span></div>
          </section>
        </>
      ) : null}

      <section key={location.pathname} className="route-shell">
      <Routes>
        <Route
          path="/"
          element={(
            <>
              <SearchPanel onSearch={handleSearch} />
              <section className="panel home-snapshot">
                <div>
                  <span className="status-label">Planning snapshot</span>
                  <h2>Your complete trip flow in one glance</h2>
                  <p className="subtle">Search from the homepage, compare rich listings, then continue on dedicated booking and profile pages.</p>
                </div>
                <ul className="insight-list">
                  <li>Dedicated routes for search, booking, profile, features, and offers.</li>
                  <li>Travel-focused homepage with destination picks and deal cards.</li>
                  <li>Guided search with enum-like autocomplete for city and property type.</li>
                </ul>
              </section>
              <DestinationsSection />
              <OffersSection />
            </>
          )}
        />
        <Route path="/features" element={<FeaturesSection />} />
        <Route
          path="/search"
          element={(
            <section className="page-layout search-layout">
              <div className="page-main">
                <section className="panel search-meta-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Search</h2>
                      <p className="subtle">{searchSummary}</p>
                    </div>
                  </div>
                  <div className="status-strip search-status">
                    <div>
                      <span className="status-label">Search refresh</span>
                      <strong>{searchState ? 'Auto-updating every 30 seconds' : 'Search to enable live refresh'}</strong>
                    </div>
                    <div>
                      <span className="status-label">Last updated</span>
                      <strong>{lastUpdated || 'Waiting for first search'}</strong>
                    </div>
                    <div>
                      <span className="status-label">Session</span>
                      <strong>{user ? `Active as ${user.username}` : 'Not logged in'}</strong>
                    </div>
                  </div>
                </section>
                <SearchPanel onSearch={handleSearch} />
                <AccommodationResults accommodations={accommodations} onSelectBooking={openBooking} />
              </div>
              <aside className="page-aside panel">
                <h2>Map View</h2>
                <p className="subtle">Marker pins follow the live search results.</p>
                <LeafletMap accommodations={accommodations} />
              </aside>
            </section>
          )}
        />
        <Route
          path="/booking"
          element={(
            <section className="page-layout booking-layout">
              <div className="page-main">
                <BookingPanel accommodation={selectedAccommodation} onBook={handleBook} />
              </div>
              <aside className="page-aside panel">
                <h2>Search Again</h2>
                <p className="subtle">Use search to pick another stay, then return to this booking route from the card action.</p>
                <SearchPanel onSearch={handleSearch} />
              </aside>
            </section>
          )}
        />
        <Route
          path="/profile"
          element={user ? (
            <section className="page-layout profile-layout">
              <div className="page-main">
                <section className="profile-hero">
                  <span className="eyebrow">Traveler profile</span>
                  <h2>Save your personal details once</h2>
                  <p>Keep your booking details ready for every trip and move faster through checkout.</p>
                </section>
                <ProfilePanel profile={profile} trips={myTrips} canEdit={Boolean(user)} onSave={handleSaveProfile} />
              </div>
              <aside className="page-aside panel">
                <h2>Profile Benefits</h2>
                <p className="subtle">Save your real traveler details once and reuse them for bookings later.</p>
                <ul className="insight-list">
                  <li>Fast checkout on the booking page.</li>
                  <li>Profile stays in session while logged in.</li>
                  <li>Data is stored in SQLite per user.</li>
                </ul>
              </aside>
            </section>
          ) : <Navigate to="/search" replace />}
        />
        <Route path="/offers" element={<OffersSection />} />
        <Route
          path="/admin"
          element={user?.admin ? (
            <AdminPanel
              clients={adminClients}
              loading={adminLoading}
              onRefresh={loadAdminClients}
              onSave={handleAdminSave}
              accommodations={adminAccommodations}
              onBlock={handleAdminBlock}
              onUnblock={handleAdminUnblock}
              onDeleteClient={handleAdminDeleteClient}
              onRefreshAccommodations={loadAdminAccommodations}
              onCreateAccommodation={handleAdminAccommodationCreate}
              onSaveAccommodation={handleAdminAccommodationSave}
              onDeleteAccommodation={handleAdminAccommodationDelete}
            />
          ) : <Navigate to="/search" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </section>

      {error ? <p className="alert error">{error}</p> : <p className="alert ok">{feedback}</p>}

      {authOpen && !user ? (
        <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Login dialog">
          <div className="auth-backdrop" onClick={() => setAuthOpen(false)} />
          <div className="auth-card panel">
            <LoginPanel
              onLogin={handleLogin}
              onRegister={handleRegister}
              onForgotPassword={handleForgotPassword}
              onLogout={handleLogout}
              loggedInUsername=""
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
