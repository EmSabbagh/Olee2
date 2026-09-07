export type IslandId = 'campaigns' | 'reels' | 'social';
export const islands: {
  id: IslandId;
  name: string;
  number: string;
  epithet: string;
  description: string;
  x: number;
  y: number;
  cropY: number;
  cropHeight: number;
  collections: string[];
  spots: number[][];
}[] = [
  {
    id: 'campaigns',
    name: 'Campaigns',
    number: '01',
    epithet: 'THE BIG IDEA ISLAND',
    description: 'Ideas that travel beyond a single canvas.',
    x: 32,
    y: 48,
    cropY: 0,
    cropHeight: 568,
    collections: [
      'Key Visuals',
      'Online Activation',
      'Onground Activation',
      'Creative 360 Campaign',
    ],
    spots: [
      [29, 37],
      [54, 24],
      [75, 55],
      [38, 72],
    ],
  },
  {
    id: 'reels',
    name: 'Reels',
    number: '02',
    epithet: 'A LITTLE MOTION MAGIC',
    description: 'Short stories. Lasting impressions.',
    x: 77,
    y: 26,
    cropY: 568,
    cropHeight: 442,
    collections: ['Reels'],
    spots: [[53, 43]],
  },
  {
    id: 'social',
    name: 'Social Media',
    number: '03',
    epithet: 'THE ALWAYS-ON ARCHIPELAGO',
    description: 'Small moments that make people stop scrolling.',
    x: 76,
    y: 75,
    cropY: 1010,
    cropHeight: 526,
    collections: ['Creative Posts', 'Stories', 'Reels'],
    spots: [
      [28, 38],
      [48, 25],
      [76, 51],
    ],
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
