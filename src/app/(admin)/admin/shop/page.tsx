import { ExternalLink, Package } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui";

// Amazon Associate Tag - replace with your tag once approved
const AMAZON_ASSOCIATE_TAG = "rentalhelper-20"; // placeholder

type Product = {
  name: string;
  category: string;
  price: number;
  image: string;
  amazonAsin: string;
  description: string;
};

// Helper to generate Amazon product image URL from ASIN
function getAmazonImageUrl(asin: string): string {
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL250_&ID=AsinImage&ServiceVersion=20070822&WS=1`;
}

const products: Product[] = [
  // Toiletries
  {
    name: "Amazon Basics Toilet Paper (30 rolls)",
    category: "Toiletries",
    price: 24.99,
    image: getAmazonImageUrl("B08JQN3S9J"),
    amazonAsin: "B08JQN3S9J",
    description: "Soft 2-ply toilet paper, septic safe",
  },
  {
    name: "Method Hand Soap Variety Pack (6 ct)",
    category: "Toiletries",
    price: 29.99,
    image: getAmazonImageUrl("B09XXWH26T"),
    amazonAsin: "B09XXWH26T",
    description: "Naturally derived, biodegradable formula",
  },
  {
    name: "Travel Size Toiletries Kit (24 pcs)",
    category: "Toiletries",
    price: 19.99,
    image: getAmazonImageUrl("B07PXLQ9QZ"),
    amazonAsin: "B07PXLQ9QZ",
    description: "Shampoo, conditioner, lotion, body wash",
  },
  {
    name: "Dove Body Wash (3 pack)",
    category: "Toiletries",
    price: 17.99,
    image: getAmazonImageUrl("B0BXJTKG4Z"),
    amazonAsin: "B0BXJTKG4Z",
    description: "Deep moisture, sensitive skin friendly",
  },
  // Cleaning Supplies
  {
    name: "Mrs. Meyer's Multi-Surface Cleaner (3 ct)",
    category: "Cleaning",
    price: 14.99,
    image: getAmazonImageUrl("B01MSDP75C"),
    amazonAsin: "B01MSDP75C",
    description: "Plant-derived cleaning ingredients",
  },
  {
    name: "Windex Glass Cleaner (2 pack)",
    category: "Cleaning",
    price: 11.99,
    image: getAmazonImageUrl("B00I9WWLBA"),
    amazonAsin: "B00I9WWLBA",
    description: "Streak-free shine for mirrors and glass",
  },
  {
    name: "Clorox Disinfecting Wipes (225 ct)",
    category: "Cleaning",
    price: 15.99,
    image: getAmazonImageUrl("B08FRSLHWD"),
    amazonAsin: "B08FRSLHWD",
    description: "Kills 99.9% of bacteria and viruses",
  },
  {
    name: "Swiffer PowerMop Refills (16 ct)",
    category: "Cleaning",
    price: 24.99,
    image: getAmazonImageUrl("B09YY71F1Q"),
    amazonAsin: "B09YY71F1Q",
    description: "All-in-one mopping pad refills",
  },
  // Paper Products
  {
    name: "Bounty Paper Towels (12 rolls)",
    category: "Paper Products",
    price: 34.99,
    image: getAmazonImageUrl("B0CBWQBRRY"),
    amazonAsin: "B0CBWQBRRY",
    description: "2X more absorbent select-a-size",
  },
  {
    name: "Glad Trash Bags 13 Gal (120 ct)",
    category: "Paper Products",
    price: 19.99,
    image: getAmazonImageUrl("B0BZ25VDPL"),
    amazonAsin: "B0BZ25VDPL",
    description: "ForceFlex with Febreze freshness",
  },
  {
    name: "Kleenex Facial Tissues (12 boxes)",
    category: "Paper Products",
    price: 22.99,
    image: getAmazonImageUrl("B08JPRZ79D"),
    amazonAsin: "B08JPRZ79D",
    description: "Soft, strong, and absorbent",
  },
  // Linens
  {
    name: "Utopia Towels 8-Piece Set",
    category: "Linens",
    price: 36.99,
    image: getAmazonImageUrl("B00IXNN5UE"),
    amazonAsin: "B00IXNN5UE",
    description: "Premium cotton bath towels, white",
  },
  {
    name: "Amazon Basics Bed Sheet Set (Queen)",
    category: "Linens",
    price: 24.99,
    image: getAmazonImageUrl("B06XSCYVX5"),
    amazonAsin: "B06XSCYVX5",
    description: "Soft microfiber, wrinkle resistant",
  },
  {
    name: "Beckham Hotel Pillows (2 pack)",
    category: "Linens",
    price: 49.99,
    image: getAmazonImageUrl("B01LYNW421"),
    amazonAsin: "B01LYNW421",
    description: "Gel-filled, cooling, Queen size",
  },
  {
    name: "Utopia Bedding Mattress Protector",
    category: "Linens",
    price: 17.99,
    image: getAmazonImageUrl("B00SHLL1Q6"),
    amazonAsin: "B00SHLL1Q6",
    description: "Waterproof, fitted, Queen size",
  },
  // Kitchen
  {
    name: "Keurig K-Cup Variety Pack (40 ct)",
    category: "Kitchen",
    price: 26.99,
    image: getAmazonImageUrl("B0BXQYL6KV"),
    amazonAsin: "B0BXQYL6KV",
    description: "Popular coffee brands sampler",
  },
  {
    name: "Dawn Dish Soap (3 pack)",
    category: "Kitchen",
    price: 14.99,
    image: getAmazonImageUrl("B08R9Z3L39"),
    amazonAsin: "B08R9Z3L39",
    description: "Ultra concentrated, cuts grease",
  },
  {
    name: "Cascade Dishwasher Pods (62 ct)",
    category: "Kitchen",
    price: 18.99,
    image: getAmazonImageUrl("B0C5ZJQ9CX"),
    amazonAsin: "B0C5ZJQ9CX",
    description: "Platinum ActionPacs, no pre-wash",
  },
  {
    name: "Scotch-Brite Sponges (9 pack)",
    category: "Kitchen",
    price: 9.99,
    image: getAmazonImageUrl("B00FHLJQXA"),
    amazonAsin: "B00FHLJQXA",
    description: "Non-scratch scrub sponges",
  },
  // Laundry
  {
    name: "Tide Pods Laundry Detergent (81 ct)",
    category: "Laundry",
    price: 27.99,
    image: getAmazonImageUrl("B084QDNKZL"),
    amazonAsin: "B084QDNKZL",
    description: "3-in-1 clean, fresh scent",
  },
  {
    name: "Downy Fabric Softener Sheets (240 ct)",
    category: "Laundry",
    price: 11.99,
    image: getAmazonImageUrl("B07PR6F1GX"),
    amazonAsin: "B07PR6F1GX",
    description: "April fresh, reduces static",
  },
];

const categories = [...new Set(products.map((p) => p.category))];

function getAmazonAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

export default function ShopSuppliesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Shop Supplies</h1>
        <p className="text-sm md:text-base text-zinc-500">
          Restock your rental properties with quality supplies
        </p>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <section key={category}>
          <h2 className="text-lg font-semibold text-zinc-800 mb-3">{category}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
            {products
              .filter((p) => p.category === category)
              .map((product) => (
                <Card key={product.amazonAsin} className="overflow-hidden">
                  <div className="aspect-square relative bg-white p-2">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-zinc-900 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-emerald-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <a
                      href={getAmazonAffiliateUrl(product.amazonAsin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-[#FFa81a] transition-colors"
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
      ))}

      {/* Affiliate Disclosure */}
      <p className="text-xs text-zinc-400 text-center pt-4 border-t border-zinc-200">
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
    </div>
  );
}
