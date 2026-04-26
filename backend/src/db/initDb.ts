import { getDb } from './database';

function formatYYMMDD(date: Date): string {
  const yy = String(date.getUTCFullYear() % 100).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

interface AccommodationSeed {
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  roomsTotal: number;
  amenities: string[];
  facilities: string[];
  images: string[];
}

const minimumAccommodationCount = 5200;

interface CitySeed {
  location: string;
  latitude: number;
  longitude: number;
}

const baseAccommodationSeeds: AccommodationSeed[] = [
  {
    name: 'Sunset Hostel',
    type: 'Hostel',
    location: 'Barcelona',
    latitude: 41.3851,
    longitude: 2.1734,
    roomsTotal: 18,
    amenities: ['Free Wi-Fi', 'Breakfast included', 'Co-working lounge', '24/7 reception'],
    facilities: ['Laundry', 'Shared kitchen', 'Bike storage', 'Airport shuttle'],
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'City Comfort Hotel',
    type: 'Hotel',
    location: 'Barcelona',
    latitude: 41.3902,
    longitude: 2.154,
    roomsTotal: 42,
    amenities: ['Pool', 'Breakfast buffet', 'High-speed Wi-Fi', 'City view suites'],
    facilities: ['Gym', 'Concierge', 'Conference room', 'Valet parking'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'Blue Ocean Apartments',
    type: 'Apartment',
    location: 'Lisbon',
    latitude: 38.7223,
    longitude: -9.1393,
    roomsTotal: 24,
    amenities: ['Kitchenette', 'Washer', 'Balcony', 'Smart TV'],
    facilities: ['Long-stay discounts', 'Self check-in', 'Ocean deck', 'Secure parking'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    name: 'Riverfront Inn',
    type: 'Hotel',
    location: 'Lisbon',
    latitude: 38.711,
    longitude: -9.14,
    roomsTotal: 30,
    amenities: ['River view', 'Room service', 'Free parking', 'Express checkout'],
    facilities: ['Spa', 'Rooftop terrace', 'Meeting rooms', 'Laundry service'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

const citySeeds: CitySeed[] = [
  { location: 'Barcelona', latitude: 41.3851, longitude: 2.1734 },
  { location: 'Lisbon', latitude: 38.7223, longitude: -9.1393 },
  { location: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { location: 'Rome', latitude: 41.9028, longitude: 12.4964 },
  { location: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { location: 'London', latitude: 51.5074, longitude: -0.1278 },
  { location: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  { location: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { location: 'Bangkok', latitude: 13.7563, longitude: 100.5018 },
  { location: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { location: 'Seoul', latitude: 37.5665, longitude: 126.978 },
  { location: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { location: 'New York', latitude: 40.7128, longitude: -74.006 },
  { location: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  { location: 'Toronto', latitude: 43.6532, longitude: -79.3832 },
  { location: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { location: 'Cape Town', latitude: -33.9249, longitude: 18.4241 },
  { location: 'Marrakech', latitude: 31.6295, longitude: -7.9811 },
  { location: 'Prague', latitude: 50.0755, longitude: 14.4378 },
  { location: 'Vienna', latitude: 48.2082, longitude: 16.3738 },
  { location: 'Hanoi', latitude: 21.0278, longitude: 105.8342 },
  { location: 'Kuala Lumpur', latitude: 3.139, longitude: 101.6869 },
  { location: 'Auckland', latitude: -36.8485, longitude: 174.7633 },
  { location: 'Mexico City', latitude: 19.4326, longitude: -99.1332 },
  { location: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816 }
];

const accommodationTypes = [
  'Hotel',
  'Resort',
  'Apartment',
  'Hostel',
  'Boutique Hotel',
  'Villa',
  'Inn',
  'Lodge'
];

const accommodationStyles = [
  'Grand',
  'Urban',
  'Skyline',
  'Harbor',
  'Heritage',
  'Panorama',
  'Voyager',
  'Crest',
  'Vista',
  'Horizon'
];

const amenityPool = [
  'Free Wi-Fi',
  'Breakfast included',
  'Pool',
  'Spa access',
  'Gym',
  '24/7 reception',
  'City view',
  'Airport shuttle',
  'Smart TV',
  'Room service',
  'Kitchenette',
  'Workspace desk',
  'Laundry service',
  'Parking',
  'Balcony'
];

const facilityPool = [
  'Concierge',
  'Valet parking',
  'Meeting rooms',
  'Rooftop terrace',
  'Shared lounge',
  'Bike storage',
  'Self check-in',
  'Restaurant',
  'Bar lounge',
  'Conference room',
  'Wellness center',
  'Laundry',
  'Private transfer',
  'Secure luggage storage',
  'Quiet work pods'
];

const imageSets = [
  [
    'https://images.unsplash.com/photo-1501117716987-c8e1ecb2109a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560067174-8943bd3a2fb5?auto=format&fit=crop&w=1200&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'
  ]
];

function pickMany(values: string[], startIndex: number, count: number): string[] {
  return Array.from({ length: count }, (_, offset) => values[(startIndex + offset) % values.length]!);
}

function generateAccommodationSeed(index: number): AccommodationSeed {
  const city = citySeeds[index % citySeeds.length]!;
  const type = accommodationTypes[index % accommodationTypes.length]!;
  const style = accommodationStyles[index % accommodationStyles.length]!;
  const suffix = String(index + 1).padStart(4, '0');
  const latitudeOffset = ((index % 9) - 4) * 0.0125;
  const longitudeOffset = ((Math.floor(index / 9) % 9) - 4) * 0.0125;

  return {
    name: `${city.location} ${style} ${type} ${suffix}`,
    type,
    location: city.location,
    latitude: Number((city.latitude + latitudeOffset).toFixed(6)),
    longitude: Number((city.longitude + longitudeOffset).toFixed(6)),
    roomsTotal: 18 + (index % 140),
    amenities: pickMany(amenityPool, index, 4),
    facilities: pickMany(facilityPool, index * 2, 4),
    images: imageSets[index % imageSets.length]!
  };
}

function buildAccommodationSeeds(targetCount: number): AccommodationSeed[] {
  const seeds = [...baseAccommodationSeeds];

  for (let index = seeds.length; index < targetCount; index += 1) {
    seeds.push(generateAccommodationSeed(index));
  }

  return seeds;
}

const accommodationSeeds = buildAccommodationSeeds(minimumAccommodationCount);

async function tableHasColumn(tableName: string, columnName: string): Promise<boolean> {
  const db = await getDb();
  const columns = await db.all<{ name: string }[]>(`PRAGMA table_info(${tableName})`);
  return columns.some((column) => column.name === columnName);
}

async function ensureAccommodationSchema(): Promise<void> {
  const db = await getDb();
  const columnsToAdd: Array<{ name: string; sql: string }> = [
    { name: 'roomsTotal', sql: `ALTER TABLE accommodation ADD COLUMN roomsTotal INTEGER NOT NULL DEFAULT 10` },
    { name: 'amenities', sql: `ALTER TABLE accommodation ADD COLUMN amenities TEXT NOT NULL DEFAULT '[]'` },
    { name: 'facilities', sql: `ALTER TABLE accommodation ADD COLUMN facilities TEXT NOT NULL DEFAULT '[]'` },
    { name: 'images', sql: `ALTER TABLE accommodation ADD COLUMN images TEXT NOT NULL DEFAULT '[]'` }
  ];

  for (const column of columnsToAdd) {
    if (!(await tableHasColumn('accommodation', column.name))) {
      await db.exec(column.sql);
    }
  }
}

async function ensureProfileSchema(): Promise<void> {
  const db = await getDb();
  if (!(await tableHasColumn('user_profiles', 'fullName'))) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userID INTEGER NOT NULL UNIQUE,
        fullName TEXT NOT NULL,
        phone TEXT NOT NULL,
        homeCity TEXT NOT NULL,
        bio TEXT NOT NULL,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES acc_users(id) ON DELETE CASCADE
      );
    `);
  }
}

async function ensureUserSchema(): Promise<void> {
  const db = await getDb();
  if (!(await tableHasColumn('acc_users', 'blocked'))) {
    await db.exec(`ALTER TABLE acc_users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0`);
  }

  if (!(await tableHasColumn('acc_users', 'superAdmin'))) {
    await db.exec(`ALTER TABLE acc_users ADD COLUMN superAdmin INTEGER NOT NULL DEFAULT 0`);
  }

  const superAdminRow = await db.get<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM acc_users
     WHERE admin = 1 AND superAdmin = 1`
  );

  if ((superAdminRow?.count ?? 0) === 0) {
    await db.run(
      `UPDATE acc_users
       SET superAdmin = 1
       WHERE id = (
         SELECT id
         FROM acc_users
         WHERE admin = 1
         ORDER BY id ASC
         LIMIT 1
       )`
    );
  }
}

async function backfillAccommodationMetadata(): Promise<void> {
  const db = await getDb();

  for (const seed of baseAccommodationSeeds) {
    await db.run(
      `UPDATE accommodation
       SET roomsTotal = ?, amenities = ?, facilities = ?, images = ?
       WHERE name = ? AND location = ?`,
      [
        seed.roomsTotal,
        JSON.stringify(seed.amenities),
        JSON.stringify(seed.facilities),
        JSON.stringify(seed.images),
        seed.name,
        seed.location
      ]
    );
  }
}

async function seedRollingAvailability(accIDs: number[]): Promise<void> {
  const db = await getDb();
  const availabilityDates = Array.from({ length: 30 }, (_, offset) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    return formatYYMMDD(date);
  });

  for (const accID of accIDs) {
    for (const thedate of availabilityDates) {
      await db.run(
        `INSERT OR IGNORE INTO acc_dates (accID, thedate, availability)
         VALUES (?, ?, ?)`,
        [accID, thedate, 10]
      );
    }
  }
}

async function ensureMinimumAccommodationSeedCount(): Promise<void> {
  const db = await getDb();

  const row = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM accommodation');
  const existingCount = row?.count ?? 0;
  if (existingCount >= minimumAccommodationCount) {
    console.log(`Database already has ${existingCount} accommodations.`);
    return;
  }

  const seedsToInsert = accommodationSeeds.slice(existingCount, minimumAccommodationCount);

  await db.exec('BEGIN TRANSACTION');
  try {
    const insertedIds: number[] = [];

    for (const seed of seedsToInsert) {
      const result = await db.run(
        `INSERT INTO accommodation (name, type, location, latitude, longitude, roomsTotal, amenities, facilities, images)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          seed.name,
          seed.type,
          seed.location,
          seed.latitude,
          seed.longitude,
          seed.roomsTotal,
          JSON.stringify(seed.amenities),
          JSON.stringify(seed.facilities),
          JSON.stringify(seed.images)
        ]
      );

      insertedIds.push(result.lastID as number);
    }

    await seedRollingAvailability(insertedIds);

    await db.exec('COMMIT');
    console.log(`Database seeded with ${insertedIds.length} accommodations.`);
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}

export async function initDb(): Promise<void> {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS accommodation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      roomsTotal INTEGER NOT NULL DEFAULT 10,
      amenities TEXT NOT NULL DEFAULT '[]',
      facilities TEXT NOT NULL DEFAULT '[]',
      images TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS acc_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accID INTEGER NOT NULL,
      thedate TEXT NOT NULL,
      availability INTEGER NOT NULL,
      FOREIGN KEY (accID) REFERENCES accommodation(id) ON DELETE CASCADE,
      UNIQUE (accID, thedate)
    );

    CREATE TABLE IF NOT EXISTS acc_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accID INTEGER NOT NULL,
      thedate TEXT NOT NULL,
      userID INTEGER NOT NULL,
      npeople INTEGER NOT NULL,
      FOREIGN KEY (accID) REFERENCES accommodation(id) ON DELETE CASCADE,
      FOREIGN KEY (userID) REFERENCES acc_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS acc_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      admin INTEGER NOT NULL DEFAULT 0,
      blocked INTEGER NOT NULL DEFAULT 0,
      superAdmin INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userID INTEGER NOT NULL UNIQUE,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      homeCity TEXT NOT NULL,
      bio TEXT NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userID) REFERENCES acc_users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_accommodation_location ON accommodation(location);
    CREATE INDEX IF NOT EXISTS idx_acc_dates_accid_date ON acc_dates(accID, thedate);
    CREATE INDEX IF NOT EXISTS idx_acc_bookings_accid_date ON acc_bookings(accID, thedate);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_userid ON user_profiles(userID);
  `);

  await ensureAccommodationSchema();
  await ensureUserSchema();
  await ensureProfileSchema();

  await ensureMinimumAccommodationSeedCount();
  await backfillAccommodationMetadata();
}

if (require.main === module) {
  initDb().catch((error: unknown) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
}
