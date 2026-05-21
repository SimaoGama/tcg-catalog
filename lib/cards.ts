export type Card = {
  id: number;
  slug: string;
  name: string;
  game: string;
  set: string;
  number: string;
  rarity: string;
  language: string;
  condition: string;
  price: number;
  forSale: boolean;
  featured: boolean;
  frontImage: string;
  backImage: string;
  notes: string;
};

export const cards: Card[] = [
  {
    id: 1,
    slug: "charizard",
    name: "Charizard ex",
    game: "Pokémon",
    set: "Obsidian Flames",
    number: "125/197",
    rarity: "Ultra Rare",
    language: "English",
    condition: "Near Mint",
    price: 45,
    forSale: true,
    featured: true,
    frontImage: "/cards/charizard/front.jpg",
    backImage: "/cards/charizard/back.jpg",
    notes: "Pack-fresh example with front and back images ready.",
  },
  {
    id: 2,
    slug: "gengar",
    name: "Gengar",
    game: "Pokémon",
    set: "Example Set",
    number: "TBD",
    rarity: "Holo / Special Art",
    language: "English",
    condition: "Near Mint",
    price: 30,
    forSale: true,
    featured: true,
    frontImage: "/cards/gengar/front.jpg",
    backImage: "/cards/gengar/back.jpg",
    notes: "Real sample card used to test image rendering and detail layout.",
  },
  {
    id: 3,
    slug: "pikachu",
    name: "Pikachu",
    game: "Pokémon",
    set: "Example Set",
    number: "TBD",
    rarity: "Illustration / Promo",
    language: "English",
    condition: "Near Mint",
    price: 20,
    forSale: true,
    featured: false,
    frontImage: "/cards/pikachu/front.jpg",
    backImage: "/cards/pikachu/back.jpg",
    notes: "Bright artwork example for checking how colorful cards render.",
  },
  {
    id: 4,
    slug: "umbreon",
    name: "Umbreon ex",
    game: "Pokémon",
    set: "Example Set",
    number: "TBD",
    rarity: "Special Art / Ultra Rare",
    language: "English",
    condition: "Near Mint",
    price: 85,
    forSale: true,
    featured: true,
    frontImage: "/cards/umbreon/front.jpg",
    backImage: "/cards/umbreon/back.jpg",
    notes: "High-interest example card for featured display testing.",
  },
  {
    id: 5,
    slug: "weavile",
    name: "Weavile",
    game: "Pokémon",
    set: "Example Set",
    number: "TBD",
    rarity: "Holo Rare",
    language: "English",
    condition: "Near Mint",
    price: 12,
    forSale: true,
    featured: false,
    frontImage: "/cards/weavile/front.jpg",
    backImage: "/cards/weavile/back.jpg",
    notes: "Lower-price example card to balance the sample catalog.",
  },
];