import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

interface HeaderNavProps {
  loggedInUsername: string;
  isAdmin: boolean;
  onOpenAuth: () => void;
  onLogout: () => Promise<void>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const navItems: Array<{ id: 'home' | 'features' | 'search' | 'offers' | 'booking' | 'admin'; label: string; to: string }> = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'features', label: 'Explore', to: '/features' },
  { id: 'search', label: 'Hotels', to: '/search' },
  { id: 'offers', label: 'Deals', to: '/offers' },
  { id: 'booking', label: 'Booking', to: '/booking' },
  { id: 'admin', label: 'Admin', to: '/admin' }
];

export default function HeaderNav({ loggedInUsername, isAdmin, onOpenAuth, onLogout, theme, onToggleTheme }: HeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const visibleNavItems = navItems.filter((item) => {
    if (!loggedInUsername && item.id === 'admin') {
      return false;
    }
    if (item.id === 'admin' && !isAdmin) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const avatarLabel = loggedInUsername ? loggedInUsername.charAt(0).toUpperCase() : '';

  return (
    <header className="site-header panel">
      <NavLink to="/" className="brand-block" aria-label="Go to homepage">
  <img className="brand-mark brand-logo" src="/logo.svg" alt="PlacesToStay logo" />
  <div>
    <strong>PlacesToStay</strong>
    <p>Hotels, stays and travel deals</p>
  </div>
</NavLink>

      <nav className="site-nav" aria-label="Main navigation">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-actions">
        <button
          type="button"
          className={theme === 'dark' ? 'theme-toggle is-dark' : 'theme-toggle is-light'}
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          aria-pressed={theme === 'dark'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="toggle-track" aria-hidden="true">
            <span className="toggle-icon sun" />
            <span className="toggle-icon moon" />
            <span className="toggle-thumb" />
          </span>
          <span className="toggle-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>

        {!loggedInUsername ? (
          <button type="button" className="ghost-button login-button" onClick={onOpenAuth}>
            Login
          </button>
        ) : (
          <div className="profile-menu" ref={menuRef}>
            <button
              type="button"
              className="profile-avatar"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open profile menu"
              title="Profile menu"
            >
              {avatarLabel}
            </button>

            {menuOpen ? (
            <div className="profile-dropdown panel" role="menu">
              <div className="profile-dropdown-head">
                <span>Signed in as</span>
                <strong>{loggedInUsername}</strong>
              </div>
              <NavLink to="/profile" className="profile-menu-item" onClick={() => setMenuOpen(false)}>
                Profile
              </NavLink>
              {isAdmin ? (
                <NavLink to="/admin" className="profile-menu-item" onClick={() => setMenuOpen(false)}>
                  Admin Panel
                </NavLink>
              ) : null}
              <button
                type="button"
                className="profile-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  void onLogout();
                }}
              >
                Logout
              </button>
            </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
