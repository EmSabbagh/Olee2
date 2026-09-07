'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import type { IslandId } from '@/lib/world';

type Actor = {
  id: string;
  kind: 'boat' | 'villager' | 'bird';
  row: number;
  path: [number, number][];
  seconds: number;
  delay: number;
};

// Each frame is cropped from the original atlas without modifying the artwork.
const spriteCrops = [
  { x: [66, 376, 683, 993], y: 70, width: 224, height: 240 },
  { x: [120, 420, 724, 1024], y: 392, width: 120, height: 200 },
  { x: [120, 420, 724, 1024], y: 680, width: 120, height: 200 },
  { x: [103, 411, 693, 991], y: 936, width: 180, height: 232 },
];

function spriteStyle(row: number, delay: number): CSSProperties {
  const crop = spriteCrops[row];
  return {
    backgroundSize: `${(1254 / crop.width) * 100}% ${(1254 / crop.height) * 100}%`,
    backgroundPositionY: `${(crop.y / (1254 - crop.height)) * 100}%`,
    '--frame-0': `${(crop.x[0] / (1254 - crop.width)) * 100}%`,
    '--frame-1': `${(crop.x[1] / (1254 - crop.width)) * 100}%`,
    '--frame-2': `${(crop.x[2] / (1254 - crop.width)) * 100}%`,
    '--frame-3': `${(crop.x[3] / (1254 - crop.width)) * 100}%`,
    animationDelay: `-${delay / 3}s`,
  } as CSSProperties;
}

const worldActors: Actor[] = [
  {
    id: 'channel-boat',
    kind: 'boat',
    row: 0,
    path: [
      [60, 49],
      [69, 49],
      [87, 49],
    ],
    seconds: 64,
    delay: 16,
  },
  {
    id: 'south-boat',
    kind: 'boat',
    row: 0,
    path: [
      [49, 94],
      [53, 87],
      [56, 77],
      [60, 64],
    ],
    seconds: 82,
    delay: 33,
  },
  {
    id: 'citadel-walker',
    kind: 'villager',
    row: 1,
    path: [
      [29, 47],
      [33, 50],
      [36, 51],
    ],
    seconds: 17,
    delay: 5,
  },
  {
    id: 'market-walker',
    kind: 'villager',
    row: 2,
    path: [
      [24, 59],
      [29, 63],
      [34, 65],
    ],
    seconds: 23,
    delay: 14,
  },
  {
    id: 'castle-walker',
    kind: 'villager',
    row: 2,
    path: [
      [34, 32],
      [38, 34],
    ],
    seconds: 12,
    delay: 4,
  },
  {
    id: 'village-walker',
    kind: 'villager',
    row: 1,
    path: [
      [71, 77],
      [76, 80],
      [80, 78],
    ],
    seconds: 19,
    delay: 9,
  },
  {
    id: 'plaza-walker',
    kind: 'villager',
    row: 2,
    path: [
      [75, 69],
      [78, 72],
      [82, 73],
    ],
    seconds: 16,
    delay: 2,
  },
];

const sceneActors: Record<IslandId, Actor[]> = {
  campaigns: [
    {
      id: 'fountain-walker',
      kind: 'villager',
      row: 1,
      path: [
        [41, 62],
        [48, 65],
        [58, 62],
      ],
      seconds: 23,
      delay: 3,
    },
    {
      id: 'workshop-walker',
      kind: 'villager',
      row: 2,
      path: [
        [29, 43],
        [38, 47],
        [45, 51],
      ],
      seconds: 24,
      delay: 13,
    },
    {
      id: 'theatre-walker',
      kind: 'villager',
      row: 1,
      path: [
        [58, 53],
        [65, 57],
        [71, 53],
      ],
      seconds: 19,
      delay: 7,
    },
    {
      id: 'gate-walker',
      kind: 'villager',
      row: 2,
      path: [
        [42, 77],
        [48, 83],
        [56, 86],
      ],
      seconds: 18,
      delay: 11,
    },
    {
      id: 'citadel-boat',
      kind: 'boat',
      row: 0,
      path: [
        [14, 90],
        [28, 96],
        [57, 98],
      ],
      seconds: 73,
      delay: 24,
    },
  ],
  reels: [
    {
      id: 'dock-walker',
      kind: 'villager',
      row: 1,
      path: [
        [31, 58],
        [40, 60],
        [48, 57],
      ],
      seconds: 21,
      delay: 8,
    },
    {
      id: 'lookout-walker',
      kind: 'villager',
      row: 2,
      path: [
        [58, 56],
        [66, 63],
        [71, 59],
      ],
      seconds: 19,
      delay: 3,
    },
    {
      id: 'harbor-boat',
      kind: 'boat',
      row: 0,
      path: [
        [14, 84],
        [33, 93],
        [58, 95],
      ],
      seconds: 64,
      delay: 17,
    },
  ],
  social: [
    {
      id: 'square-walker',
      kind: 'villager',
      row: 1,
      path: [
        [35, 51],
        [42, 60],
        [49, 62],
      ],
      seconds: 19,
      delay: 6,
    },
    {
      id: 'garden-walker',
      kind: 'villager',
      row: 2,
      path: [
        [57, 62],
        [63, 57],
        [70, 55],
      ],
      seconds: 18,
      delay: 11,
    },
    {
      id: 'stalls-walker',
      kind: 'villager',
      row: 1,
      path: [
        [43, 79],
        [51, 79],
        [58, 73],
      ],
      seconds: 24,
      delay: 2,
    },
    {
      id: 'village-boat',
      kind: 'boat',
      row: 0,
      path: [
        [19, 93],
        [39, 97],
        [62, 95],
      ],
      seconds: 75,
      delay: 30,
    },
  ],
};

const birds: Actor[] = [
  {
    id: 'gull-leader',
    kind: 'bird',
    row: 3,
    path: [
      [-4, 23],
      [33, 15],
      [70, 18],
      [105, 28],
    ],
    seconds: 38,
    delay: 9,
  },
  {
    id: 'gull-follow',
    kind: 'bird',
    row: 3,
    path: [
      [-6, 27],
      [31, 19],
      [68, 22],
      [103, 32],
    ],
    seconds: 38,
    delay: 7.8,
  },
  {
    id: 'gull-solo',
    kind: 'bird',
    row: 3,
    path: [
      [-5, 64],
      [30, 58],
      [70, 62],
      [105, 53],
    ],
    seconds: 46,
    delay: 29,
  },
];

export function WorldLife({ scene = 'world' }: { scene?: IslandId | 'world' }) {
  const root = useRef<HTMLDivElement>(null);
  const actors = [
    ...(scene === 'world' ? worldActors : sceneActors[scene]),
    ...birds,
  ];

  useEffect(() => {
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const elements =
      root.current?.querySelectorAll<HTMLElement>('[data-actor]');
    const animations: Animation[] = [];
    const currentActors = [
      ...(scene === 'world' ? worldActors : sceneActors[scene]),
      ...birds,
    ];
    elements?.forEach((element, index) => {
      const actor = currentActors[index];
      const animation = element.animate(
        actor.path.map(([x, y], point) => ({
          left: `${x}%`,
          top: `${y}%`,
          opacity:
            actor.kind === 'bird' &&
            (point === 0 || point === actor.path.length - 1)
              ? 0
              : 1,
        })),
        {
          duration: actor.seconds * 1000,
          delay: -actor.delay * 1000,
          iterations: Infinity,
          direction: actor.kind === 'bird' ? 'normal' : 'alternate',
          easing: 'linear',
        },
      );
      animations.push(animation);
    });
    const syncMotion = () => {
      const paused = document.hidden || motionPreference.matches;
      for (const animation of animations) {
        if (paused) animation.pause();
        else animation.play();
      }
      root.current?.classList.toggle('motion-paused', paused);
    };
    syncMotion();
    motionPreference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    return () => {
      animations.forEach((animation) => animation.cancel());
      motionPreference.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncMotion);
    };
  }, [scene]);

  return (
    <div className={`world-life life-${scene}`} aria-hidden="true" ref={root}>
      {actors.map((actor) => (
        <div
          key={actor.id}
          data-actor={actor.id}
          className={`map-actor actor-${actor.kind}`}
          style={{ left: `${actor.path[0][0]}%`, top: `${actor.path[0][1]}%` }}
        >
          <span
            className="actor-facing"
            style={
              {
                '--facing':
                  actor.path[actor.path.length - 1][0] >= actor.path[0][0]
                    ? 1
                    : -1,
                animationDuration: `${actor.seconds * 2}s`,
                animationDelay: `-${actor.delay}s`,
              } as CSSProperties
            }
          >
            <span
              className="sprite-sheet"
              style={spriteStyle(actor.row, actor.delay)}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
