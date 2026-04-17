export interface FashionItem {
  id: string;
  name: string;
  category: FashionCategory;
  thumbnail: string;
}

export type FashionCategory = 'headwear' | 'eyewear' | 'tops' | 'accessories' | 'footwear';

export const CATEGORY_LABELS: Record<FashionCategory, string> = {
  headwear: '🧢 Headwear',
  eyewear: '🕶️ Eyewear',
  tops: '👕 Tops',
  accessories: '💎 Accessories',
  footwear: '👟 Footwear',
};

export const FASHION_ITEMS: FashionItem[] = [
  {
    id: 'dmooster-headphones',
    name: 'DMOOSTER Headphones',
    category: 'accessories',
    thumbnail: '/fashion/headphones.webp',
  },
  {
    id: 'tge-sunglasses',
    name: 'TGE Sunglasses',
    category: 'eyewear',
    thumbnail: '/fashion/sunglasses.webp',
  },
  {
    id: 'ny-cap',
    name: 'NY Classic Cap',
    category: 'headwear',
    thumbnail: '/fashion/ny-cap.webp',
  },
  {
    id: 'cali-sweater',
    name: 'Cali Oversized Sweater',
    category: 'tops',
    thumbnail: '/fashion/cali-sweater.webp',
  },
];

export const FASHION_PROMPTS: Record<string, string> = {
  'dmooster-headphones': "wearing large off-white over-ear headphones with a bold red 'X' mark on the headband and 'DMOOSTER' text on the earcup",
  'tge-sunglasses': "wearing futuristic thick black rectangular frame sunglasses with blue tinted lenses in a 'TGE COMING' stylized tech vibe",
  'ny-cap': "wearing a classic black baseball cap with a white embroidered 'NY' logo on the front",
  'cali-sweater': "wearing an oversized brown crewneck sweatshirt with bold white 'CALIFORNIA LOS ANGELES' arched text across the chest",
};

