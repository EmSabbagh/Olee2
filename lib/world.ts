export type IslandId = 'campaigns' | 'reels' | 'social';
export const islands: {
  id: IslandId;
  name: string;
  number: string;
  epithet: string;
  description: string;
  /** Accent color for this island's 3D landmark highlight. */
  accent: string;
  collections: string[];
}[] = [
  {
    id: 'campaigns',
    name: 'Campaigns',
    number: '01',
    epithet: 'THE BIG IDEA ISLAND',
    description: 'Ideas that travel beyond a single canvas.',
    accent: '#E8B23D',
    collections: [
      'Key Visuals',
      'Online Activation',
      'Onground Activation',
      'Creative 360 Campaign',
    ],
  },
  {
    id: 'reels',
    name: 'Reels',
    number: '02',
    epithet: 'A LITTLE MOTION MAGIC',
    description: 'Short stories. Lasting impressions.',
    accent: '#E0574A',
    collections: ['Reels'],
  },
  {
    id: 'social',
    name: 'Social Media',
    number: '03',
    epithet: 'THE ALWAYS-ON ARCHIPELAGO',
    description: 'Small moments that make people stop scrolling.',
    accent: '#F2A65A',
    collections: ['Creative Posts', 'Stories', 'Reels'],
  },
];
export function getLocation(hash: string): {
  island: IslandId | null;
  collection: string | null;
} {
  const [id, rawCategory] = hash.replace(/^#/, '').split('/');
  const island = islands.find((item) => item.id === id);
  if (!island) return { island: null, collection: null };
  let category = '';
  try {
    category = decodeURIComponent(rawCategory || '');
  } catch {
    /* Ignore malformed links. */
  }
  return {
    island: island.id,
    collection: island.collections.includes(category) ? category : null,
  };
}
