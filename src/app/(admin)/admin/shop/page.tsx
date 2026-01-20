"use client";

import { ExternalLink, Package, ShoppingBag, Sparkles, Shirt, Coffee, WashingMachine, Bath, Scroll } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui";
import { getAmazonUrl, AMAZON_ASSOCIATE_TAG } from "@/lib/amazon";

type Product = {
  name: string;
  category: string;
  price: number;
  amazonAsin: string;
  description: string;
};

// Category icons for section headers
const categoryConfig: Record<string, { icon: React.ElementType; iconColor: string }> = {
  Toiletries: { icon: Bath, iconColor: "text-zinc-500" },
  Cleaning: { icon: Sparkles, iconColor: "text-zinc-500" },
  "Paper Products": { icon: Scroll, iconColor: "text-zinc-500" },
  Linens: { icon: Shirt, iconColor: "text-zinc-500" },
  Kitchen: { icon: Coffee, iconColor: "text-zinc-500" },
  Laundry: { icon: WashingMachine, iconColor: "text-zinc-500" },
};

const products: Product[] = [
  // Toiletries
  {
    name: "Amazon Basics Toilet Paper (30 rolls)",
    category: "Toiletries",
    price: 24.99,
    amazonAsin: "B08JQN3S9J",
    description: "Soft 2-ply toilet paper, septic safe",
  },
  {
    name: "Method Hand Soap Variety Pack (6 ct)",
    category: "Toiletries",
    price: 29.99,
    amazonAsin: "B09XXWH26T",
    description: "Naturally derived, biodegradable formula",
  },
  {
    name: "Travel Size Toiletries Kit (24 pcs)",
    category: "Toiletries",
    price: 19.99,
    amazonAsin: "B07PXLQ9QZ",
    description: "Shampoo, conditioner, lotion, body wash",
  },
  {
    name: "Dove Body Wash (3 pack)",
    category: "Toiletries",
    price: 17.99,
    amazonAsin: "B0BXJTKG4Z",
    description: "Deep moisture, sensitive skin friendly",
  },
  // Cleaning Supplies
  {
    name: "Mrs. Meyer's Multi-Surface Cleaner (3 ct)",
    category: "Cleaning",
    price: 14.99,
    amazonAsin: "B01MSDP75C",
    description: "Plant-derived cleaning ingredients",
  },
  {
    name: "Windex Glass Cleaner (2 pack)",
    category: "Cleaning",
    price: 11.99,
    amazonAsin: "B00I9WWLBA",
    description: "Streak-free shine for mirrors and glass",
  },
  {
    name: "Clorox Disinfecting Wipes (225 ct)",
    category: "Cleaning",
    price: 15.99,
    amazonAsin: "B08FRSLHWD",
    description: "Kills 99.9% of bacteria and viruses",
  },
  {
    name: "Swiffer PowerMop Refills (16 ct)",
    category: "Cleaning",
    price: 24.99,
    amazonAsin: "B09YY71F1Q",
    description: "All-in-one mopping pad refills",
  },
  // Paper Products
  {
    name: "Bounty Paper Towels (12 rolls)",
    category: "Paper Products",
    price: 34.99,
    amazonAsin: "B0CBWQBRRY",
    description: "2X more absorbent select-a-size",
  },
  {
    name: "Glad Trash Bags 13 Gal (120 ct)",
    category: "Paper Products",
    price: 19.99,
    amazonAsin: "B0BZ25VDPL",
    description: "ForceFlex with Febreze freshness",
  },
  {
    name: "Kleenex Facial Tissues (12 boxes)",
    category: "Paper Products",
    price: 22.99,
    amazonAsin: "B08JPRZ79D",
    description: "Soft, strong, and absorbent",
  },
  // Linens
  {
    name: "Utopia Towels 8-Piece Set",
    category: "Linens",
    price: 36.99,
    amazonAsin: "B00IXNN5UE",
    description: "Premium cotton bath towels, white",
  },
  {
    name: "Amazon Basics Bed Sheet Set (Queen)",
    category: "Linens",
    price: 24.99,
    amazonAsin: "B06XSCYVX5",
    description: "Soft microfiber, wrinkle resistant",
  },
  {
    name: "Beckham Hotel Pillows (2 pack)",
    category: "Linens",
    price: 49.99,
    amazonAsin: "B01LYNW421",
    description: "Gel-filled, cooling, Queen size",
  },
  {
    name: "Utopia Bedding Mattress Protector",
    category: "Linens",
    price: 17.99,
    amazonAsin: "B00SHLL1Q6",
    description: "Waterproof, fitted, Queen size",
  },
  // Kitchen
  {
    name: "Keurig K-Cup Variety Pack (40 ct)",
    category: "Kitchen",
    price: 26.99,
    amazonAsin: "B0BXQYL6KV",
    description: "Popular coffee brands sampler",
  },
  {
    name: "Dawn Dish Soap (3 pack)",
    category: "Kitchen",
    price: 14.99,
    amazonAsin: "B08R9Z3L39",
    description: "Ultra concentrated, cuts grease",
  },
  {
    name: "Cascade Dishwasher Pods (62 ct)",
    category: "Kitchen",
    price: 18.99,
    amazonAsin: "B0C5ZJQ9CX",
    description: "Platinum ActionPacs, no pre-wash",
  },
  {
    name: "Scotch-Brite Sponges (9 pack)",
    category: "Kitchen",
    price: 9.99,
    amazonAsin: "B00FHLJQXA",
    description: "Non-scratch scrub sponges",
  },
  // Laundry
  {
    name: "Tide Pods Laundry Detergent (81 ct)",
    category: "Laundry",
    price: 27.99,
    amazonAsin: "B084QDNKZL",
    description: "3-in-1 clean, fresh scent",
  },
  {
    name: "Downy Fabric Softener Sheets (240 ct)",
    category: "Laundry",
    price: 11.99,
    amazonAsin: "B07PR6F1GX",
    description: "April fresh, reduces static",
  },
];

const categories = [...new Set(products.map((p) => p.category))];

function getProductImageUrl(asin: string): string {
  return `/products/${asin}.png`;
}

export default function ShopSuppliesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Shop Supplies</h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">
          Restock your rental properties with quality supplies
        </p>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const config = categoryConfig[category];
        const CategoryIcon = config?.icon || ShoppingBag;
        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-3">
              <CategoryIcon className={`h-5 w-5 ${config?.iconColor || 'text-zinc-500'}`} />
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{category}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
              {products
                .filter((p) => p.category === category)
                .map((product) => (
                  <Card key={product.amazonAsin} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square relative bg-white dark:bg-zinc-900">
                      <Image
                        src={getProductImageUrl(product.amazonAsin)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-zinc-900">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <a
                        href={getAmazonUrl(product.amazonAsin, 1)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        Buy on Amazon
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        );
      })}

      {/* Affiliate Disclosure */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center pt-4 border-t border-zinc-200 dark:border-zinc-700">
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
    </div>
  );
}
