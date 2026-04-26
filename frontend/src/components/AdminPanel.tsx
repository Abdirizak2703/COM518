import { FormEvent, useMemo, useState } from 'react';
import { AdminAccommodation, AdminClient } from '../types';

interface AdminPanelProps {
  clients: AdminClient[];
  accommodations: AdminAccommodation[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onRefreshAccommodations: () => Promise<void>;
  onSave: (input: {
    userID: number;
    username: string;
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
  }) => Promise<void>;
  onBlock: (userID: number) => Promise<void>;
  onUnblock: (userID: number) => Promise<void>;
  onDeleteClient: (userID: number) => Promise<void>;
  onSaveAccommodation: (input: {
    id: number;
    name: string;
    type: string;
    location: string;
    roomsTotal: number;
    images: string[];
  }) => Promise<void>;
  onCreateAccommodation: (input: {
    name: string;
    type: string;
    location: string;
    roomsTotal: number;
    images: string[];
  }) => Promise<void>;
  onDeleteAccommodation: (id: number) => Promise<void>;
}

export default function AdminPanel({
  clients,
  accommodations,
  loading,
  onRefresh,
  onRefreshAccommodations,
  onSave,
  onBlock,
  onUnblock,
  onDeleteClient,
  onCreateAccommodation,
  onSaveAccommodation,
  onDeleteAccommodation
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'clients' | 'accommodations'>('clients');
  const [selectedUserID, setSelectedUserID] = useState<number | null>(null);
  const [selectedAccommodationID, setSelectedAccommodationID] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [bio, setBio] = useState('');
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('');
  const [accLocation, setAccLocation] = useState('');
  const [accRoomsTotal, setAccRoomsTotal] = useState(1);
  const [accImageUrl, setAccImageUrl] = useState('');
  const [accImages, setAccImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingAccommodation, setSavingAccommodation] = useState(false);

  const selectedClient = useMemo(
    () => clients.find((client) => client.userID === selectedUserID) ?? null,
    [clients, selectedUserID]
  );

  const selectedAccommodation = useMemo(
    () => accommodations.find((item) => item.id === selectedAccommodationID) ?? null,
    [accommodations, selectedAccommodationID]
  );

  function loadClient(client: AdminClient): void {
    setSelectedUserID(client.userID);
    setUsername(client.username);
    setFullName(client.fullName);
    setPhone(client.phone);
    setHomeCity(client.homeCity);
    setBio(client.bio);
  }

  function loadAccommodation(item: AdminAccommodation): void {
    setSelectedAccommodationID(item.id);
    setAccName(item.name);
    setAccType(item.type);
    setAccLocation(item.location);
    setAccRoomsTotal(item.roomsTotal);
    setAccImages(item.images);
    setAccImageUrl('');
  }

  function addImageUrl(): void {
    const normalized = accImageUrl.trim();
    if (!normalized) {
      return;
    }

    if (accImages.includes(normalized) || accImages.length >= 12) {
      return;
    }

    setAccImages((current) => [...current, normalized]);
    setAccImageUrl('');
  }

  async function addImagesFromFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(files).slice(0, Math.max(0, 12 - accImages.length));
    const converted = await Promise.all(selectedFiles.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    })));

    setAccImages((current) => {
      const merged = [...current, ...converted.filter((item) => item.length > 0 && !current.includes(item))];
      return merged.slice(0, 12);
    });
  }

  function removeImage(image: string): void {
    setAccImages((current) => current.filter((item) => item !== image));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedUserID) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        userID: selectedUserID,
        username,
        fullName,
        phone,
        homeCity,
        bio
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAccommodationSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedAccommodationID) {
      return;
    }

    setSavingAccommodation(true);
    try {
      await onSaveAccommodation({
        id: selectedAccommodationID,
        name: accName,
        type: accType,
        location: accLocation,
        roomsTotal: accRoomsTotal,
        images: accImages.length > 0 ? accImages : ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80']
      });
    } finally {
      setSavingAccommodation(false);
    }
  }

  async function handleCreateAccommodation(): Promise<void> {
    setSavingAccommodation(true);
    try {
      await onCreateAccommodation({
        name: accName,
        type: accType,
        location: accLocation,
        roomsTotal: accRoomsTotal,
        images: accImages.length > 0 ? accImages : ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80']
      });
    } finally {
      setSavingAccommodation(false);
    }
  }

  return (
    <section className="page-layout admin-tabs-layout">
      <section className="panel admin-tab-bar">
        <div>
          <h2>Admin Panel</h2>
          <p className="subtle">Use separate tabs for client moderation and accommodation management.</p>
        </div>
        <div className="admin-tab-buttons" role="tablist" aria-label="Admin sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'clients'}
            className={activeTab === 'clients' ? 'admin-tab-button active' : 'admin-tab-button'}
            onClick={() => setActiveTab('clients')}
          >
            Clients
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'accommodations'}
            className={activeTab === 'accommodations' ? 'admin-tab-button active' : 'admin-tab-button'}
            onClick={() => setActiveTab('accommodations')}
          >
            Accommodations
          </button>
        </div>
      </section>

      {activeTab === 'clients' ? (
        <div className="admin-tab-content">
          <section className="panel page-main">
            <div className="panel-heading">
              <div>
                <h2>Client Data</h2>
                <p className="subtle">Manage client profile details and usernames directly from the admin dashboard.</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => void onRefresh()} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh clients'}
              </button>
            </div>

            <div className="admin-client-list">
              {clients.map((client) => (
                <button
                  key={client.userID}
                  type="button"
                  className={selectedUserID === client.userID ? 'admin-client-item active' : 'admin-client-item'}
                  onClick={() => loadClient(client)}
                >
                  <strong>{client.username}</strong>
                  <span>{client.fullName || 'Profile not filled yet'}</span>
                  <small>{client.admin ? 'Admin' : client.blocked ? 'Blocked user' : 'Client'}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="panel page-aside">
            <h2>Edit Client</h2>
            {selectedClient ? (
              <form className="stack" onSubmit={(event) => void handleSubmit(event)}>
                <label>
                  Username
                  <input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={50} />
                </label>
                <label>
                  Full name
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} maxLength={80} />
                </label>
                <label>
                  Phone
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} required minLength={7} maxLength={20} />
                </label>
                <label>
                  Home city
                  <input value={homeCity} onChange={(event) => setHomeCity(event.target.value)} required minLength={2} maxLength={80} />
                </label>
                <label>
                  Bio
                  <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={320} rows={4} />
                </label>
                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save client data'}</button>
                <div className="admin-action-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => void (selectedClient.blocked ? onUnblock(selectedClient.userID) : onBlock(selectedClient.userID))}
                  >
                    {selectedClient.blocked ? 'Unblock user' : 'Block user'}
                  </button>
                  <button type="button" onClick={() => void onDeleteClient(selectedClient.userID)}>Delete user</button>
                </div>
              </form>
            ) : (
              <div className="booking-empty">
                <strong>Select a client</strong>
                <p>Choose a client from the list to edit username and profile details.</p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="admin-tab-content">
          <section className="panel page-main">
            <div className="panel-heading">
              <div>
                <h2>Accommodation Data</h2>
                <p className="subtle">Update or delete accommodation records from admin portal.</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => void onRefreshAccommodations()} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh accommodations'}
              </button>
            </div>

            <div className="admin-client-list">
              {accommodations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={selectedAccommodationID === item.id ? 'admin-client-item active' : 'admin-client-item'}
                  onClick={() => loadAccommodation(item)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.type} in {item.location}</span>
                  <small>{item.roomsTotal} rooms total</small>
                </button>
              ))}
            </div>
          </section>

          <section className="panel page-aside">
            <h2>Edit Accommodation</h2>
            {selectedAccommodation ? (
              <form className="stack" onSubmit={(event) => void handleAccommodationSubmit(event)}>
                <label>
                  Name
                  <input value={accName} onChange={(event) => setAccName(event.target.value)} required minLength={2} maxLength={120} />
                </label>
                <label>
                  Type
                  <input value={accType} onChange={(event) => setAccType(event.target.value)} required minLength={2} maxLength={60} />
                </label>
                <label>
                  Location
                  <input value={accLocation} onChange={(event) => setAccLocation(event.target.value)} required minLength={2} maxLength={120} />
                </label>
                <label>
                  Total rooms
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={accRoomsTotal}
                    onChange={(event) => setAccRoomsTotal(Number(event.target.value) || 1)}
                    required
                  />
                </label>
                <label>
                  Add image URL
                  <div className="admin-image-url-row">
                    <input
                      value={accImageUrl}
                      onChange={(event) => setAccImageUrl(event.target.value)}
                      placeholder="https://example.com/image.jpg"
                      maxLength={2048}
                    />
                    <button type="button" className="secondary-button" onClick={addImageUrl}>Add URL</button>
                  </div>
                </label>
                <label>
                  Upload image files
                  <input type="file" accept="image/*" multiple onChange={(event) => void addImagesFromFiles(event.target.files)} />
                </label>
                <div className="admin-image-preview-grid">
                  {accImages.map((image) => (
                    <div key={image} className="admin-image-preview-item">
                      <span style={{ backgroundImage: `url(${image})` }} />
                      <button type="button" className="secondary-button" onClick={() => removeImage(image)}>Remove</button>
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={savingAccommodation}>{savingAccommodation ? 'Saving...' : 'Save accommodation'}</button>
                <button type="button" className="secondary-button" onClick={() => void handleCreateAccommodation()} disabled={savingAccommodation}>
                  {savingAccommodation ? 'Creating...' : 'Create accommodation'}
                </button>
                <button type="button" onClick={() => void onDeleteAccommodation(selectedAccommodation.id)}>Delete accommodation</button>
              </form>
            ) : (
              <form className="stack" onSubmit={(event) => {
                event.preventDefault();
                void handleCreateAccommodation();
              }}>
                <p className="subtle">No accommodation selected. Fill fields below to create a new one.</p>
                <label>
                  Name
                  <input value={accName} onChange={(event) => setAccName(event.target.value)} required minLength={2} maxLength={120} />
                </label>
                <label>
                  Type
                  <input value={accType} onChange={(event) => setAccType(event.target.value)} required minLength={2} maxLength={60} />
                </label>
                <label>
                  Location
                  <input value={accLocation} onChange={(event) => setAccLocation(event.target.value)} required minLength={2} maxLength={120} />
                </label>
                <label>
                  Total rooms
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={accRoomsTotal}
                    onChange={(event) => setAccRoomsTotal(Number(event.target.value) || 1)}
                    required
                  />
                </label>
                <label>
                  Add image URL
                  <div className="admin-image-url-row">
                    <input
                      value={accImageUrl}
                      onChange={(event) => setAccImageUrl(event.target.value)}
                      placeholder="https://example.com/image.jpg"
                      maxLength={2048}
                    />
                    <button type="button" className="secondary-button" onClick={addImageUrl}>Add URL</button>
                  </div>
                </label>
                <label>
                  Upload image files
                  <input type="file" accept="image/*" multiple onChange={(event) => void addImagesFromFiles(event.target.files)} />
                </label>
                <div className="admin-image-preview-grid">
                  {accImages.map((image) => (
                    <div key={image} className="admin-image-preview-item">
                      <span style={{ backgroundImage: `url(${image})` }} />
                      <button type="button" className="secondary-button" onClick={() => removeImage(image)}>Remove</button>
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={savingAccommodation}>{savingAccommodation ? 'Creating...' : 'Create accommodation'}</button>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
