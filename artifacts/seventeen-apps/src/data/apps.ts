/**
 * The eighteen apps, exactly as supplied. Names, descriptions and URLs are
 * authoritative — do not rewrite them or infer them from anywhere else.
 *
 * `image` is a path relative to the Vite base URL. Files live in
 * `public/apps/`, sourced from each app's live Open Graph preview where one
 * was available, and from a live capture of the app otherwise.
 */
export interface ShowcaseApp {
  /** 1-indexed position, rendered as a two-digit number on the card tab. */
  number: number;
  name: string;
  description: string;
  url: string;
  /** Path under `public/`, e.g. `apps/1satchel.webp`. */
  image: string;
}

export const apps: ShowcaseApp[] = [
  {
    number: 1,
    name: '1Satchel',
    description: 'Every link can charge for itself',
    url: 'https://1satchel.com',
    image: 'apps/1satchel.webp',
  },
  {
    number: 2,
    name: 'Permastack',
    description: 'Publish forever on BSV',
    url: 'https://permastackpress.com',
    image: 'apps/permastack.webp',
  },
  {
    number: 3,
    name: 'MintPage',
    description: 'Design and deploy on BSV',
    url: 'https://mintpage.pro',
    image: 'apps/mintpage.webp',
  },
  {
    number: 4,
    name: 'SonicStar',
    description: 'Mint your music on the blockchain',
    url: 'https://sonicstar.net',
    image: 'apps/sonicstar.webp',
  },
  {
    number: 5,
    name: 'BSV Patent Forge',
    description:
      'Turn the nChain and Teranode patent vault into buildable opportunities',
    url: 'https://bsvpatentforge.com',
    image: 'apps/bsv-patent-forge.webp',
  },
  {
    number: 6,
    name: 'Wonkerly',
    description: 'Personalised nonsense verses for the people you tolerate',
    url: 'https://wonkerly.com',
    image: 'apps/wonkerly.webp',
  },
  {
    number: 7,
    name: 'BrandCaster',
    description: 'AI-generated brand bibles in minutes',
    url: 'https://brandcaster.studio',
    image: 'apps/brandcaster.webp',
  },
  {
    number: 8,
    name: 'VibeGlowUp',
    description: 'AI-powered virtual try-on',
    url: 'https://vibeglowup.com',
    image: 'apps/vibeglowup.webp',
  },
  {
    number: 9,
    name: 'Rapid Reader',
    description: 'Read faster, comprehend more',
    url: 'https://rapidreader.net',
    image: 'apps/rapid-reader.webp',
  },
  {
    number: 10,
    name: 'StartupScout',
    description: 'AI-powered startup analysis',
    url: 'https://startupscout.co',
    image: 'apps/startupscout.webp',
  },
  {
    number: 11,
    name: 'Number Cruncher 3D',
    description: 'Solve 3D maths puzzles',
    url: 'https://numbercrunchermath.com',
    image: 'apps/number-cruncher-3d.webp',
  },
  {
    number: 12,
    name: 'The AI-Bitcoin Revolution',
    description: "Building tomorrow's trust infrastructure",
    url: 'https://aibitcoinrevolution.com',
    image: 'apps/ai-bitcoin-revolution.webp',
  },
  {
    number: 13,
    name: 'BSV Halloween Memory Game',
    description: 'Women of BSV Halloween NFTs in memory game form',
    url: 'https://bsv-halloween-snap-game.replit.app',
    image: 'apps/bsv-halloween.webp',
  },
  {
    number: 14,
    name: 'AI Chef',
    description: 'Turn grocery lists into dinner ideas',
    url: 'https://ai-chef-assistant--ruthheasman.replit.app',
    image: 'apps/ai-chef.webp',
  },
  {
    number: 15,
    name: 'Terapong',
    description: 'Nano-payment arcade game',
    url: 'https://terapong-game.replit.app',
    image: 'apps/terapong.webp',
  },
  {
    number: 16,
    name: 'VeriHalo',
    description: 'Patient-owned, blockchain-verified health records',
    url: 'https://veri-halo.replit.app/web/',
    image: 'apps/verihalo.webp',
  },
  {
    number: 17,
    name: 'Quiz Battle Live',
    description: 'Real-time BSV trivia battles',
    url: 'https://quiz-battle-live.replit.app',
    image: 'apps/quiz-battle-live.webp',
  },
  {
    number: 18,
    name: 'Blockspace',
    description: "An 80s Styx clone that mimics Teranode's block building",
    url: 'https://blockspace-ruthheasman.replit.app',
    image: 'apps/blockspace.webp',
  },
];

/** Resolve a manifest image path against the artifact's base URL. */
export function appImageUrl(app: ShowcaseApp): string {
  return `${import.meta.env.BASE_URL}${app.image}`;
}
