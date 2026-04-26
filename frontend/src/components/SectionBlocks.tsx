export function FeaturesSection() {
  const features = [
    {
      title: 'Smart search flow',
      text: 'City and property type autocomplete helps users discover stays faster with cleaner input.',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Live room inventory',
      text: 'Availability refreshes while browsing so booking decisions reflect current room counts.',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Dedicated booking desk',
      text: 'A separate booking page keeps confirmation inputs focused and easier to complete.',
      image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Traveler profile page',
      text: 'Saved traveler identity and contact details improve repeat booking speed.',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <section className="section-block">
      <div className="section-intro">
        <span className="eyebrow">Explore</span>
        <h2>Built for modern hotel booking behavior</h2>
        <p>Designed around the same expectations users have from mainstream travel booking portals.</p>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card panel">
            <div className="feature-visual" style={{ backgroundImage: `url(${feature.image})` }} />
            <div className="feature-body">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function OffersSection() {
  const offers = [
    {
      label: '01',
      title: 'Flat 20% off on premium city-center stays',
      image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb2109a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      label: '02',
      title: 'Extended stay discounts for weekly bookings',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    },
    {
      label: '03',
      title: 'Breakfast and airport transfer combo packages',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    },
    {
      label: '04',
      title: 'Family room bundles with flexible cancellation',
      image: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <section className="section-block">
      <div className="section-intro">
        <span className="eyebrow">Deals</span>
        <h2>Trending offers for this week</h2>
        <p>Promotional cards styled for a travel-commerce homepage.</p>
      </div>
      <div className="offers-grid">
        {offers.map((offer) => (
          <article key={offer.title} className="offer-card panel">
            <div className="offer-visual" style={{ backgroundImage: `url(${offer.image})` }}>
              <span>{offer.label}</span>
            </div>
            <p>{offer.title}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DestinationsSection() {
  const destinations = [
    {
      city: 'Barcelona',
      mood: 'Seaside luxury and boutique lanes',
      tag: 'Hot right now',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      city: 'Lisbon',
      mood: 'Historic neighborhoods with river views',
      tag: 'Most searched',
      image: 'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1200&q=80'
    },
    {
      city: 'Porto',
      mood: 'Riverside old town and wine routes',
      tag: 'Best value',
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      city: 'Madrid',
      mood: 'Business plus leisure district hotels',
      tag: 'Weekend special',
      image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <section className="section-block">
      <div className="section-intro">
        <span className="eyebrow">Popular destinations</span>
        <h2>Discover where travelers are booking next</h2>
        <p>Destination-led discovery inspired by high-conversion travel homepages.</p>
      </div>
      <div className="destination-grid">
        {destinations.map((destination) => (
          <article key={destination.city} className="destination-card panel">
            <div className="destination-visual" style={{ backgroundImage: `url(${destination.image})` }}>
              <span>{destination.tag}</span>
            </div>
            <h3>{destination.city}</h3>
            <p>{destination.mood}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
