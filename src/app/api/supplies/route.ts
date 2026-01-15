import { NextResponse } from "next/server";

// Amazon Associate Tag
const AMAZON_ASSOCIATE_TAG = "rentalhelper-20";

// Helper to generate Amazon product image URL from ASIN
function getAmazonImageUrl(asin: string): string {
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL250_&ID=AsinImage&ServiceVersion=20070822&WS=1`;
}

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  amazonAsin: string;
  description: string;
};

const products: Product[] = [
  // Toiletries
  {
    id: "prod_toilet_paper",
    name: "Amazon Basics Toilet Paper (30 rolls)",
    category: "Toiletries",
    price: 24.99,
    image: getAmazonImageUrl("B08JQN3S9J"),
    amazonAsin: "B08JQN3S9J",
    description: "Soft 2-ply toilet paper, septic safe",
  },
  {
    id: "prod_hand_soap",
    name: "Method Hand Soap Variety Pack (6 ct)",
    category: "Toiletries",
    price: 29.99,
    image: getAmazonImageUrl("B09XXWH26T"),
    amazonAsin: "B09XXWH26T",
    description: "Naturally derived, biodegradable formula",
  },
  {
    id: "prod_toiletries_kit",
    name: "Travel Size Toiletries Kit (24 pcs)",
    category: "Toiletries",
    price: 19.99,
    image: getAmazonImageUrl("B07PXLQ9QZ"),
    amazonAsin: "B07PXLQ9QZ",
    description: "Shampoo, conditioner, lotion, body wash",
  },
  {
    id: "prod_body_wash",
    name: "Dove Body Wash (3 pack)",
    category: "Toiletries",
    price: 17.99,
    image: getAmazonImageUrl("B0BXJTKG4Z"),
    amazonAsin: "B0BXJTKG4Z",
    description: "Deep moisture, sensitive skin friendly",
  },
  // Cleaning Supplies
  {
    id: "prod_multi_surface",
    name: "Mrs. Meyer's Multi-Surface Cleaner (3 ct)",
    category: "Cleaning",
    price: 14.99,
    image: getAmazonImageUrl("B01MSDP75C"),
    amazonAsin: "B01MSDP75C",
    description: "Plant-derived cleaning ingredients",
  },
  {
    id: "prod_glass_cleaner",
    name: "Windex Glass Cleaner (2 pack)",
    category: "Cleaning",
    price: 11.99,
    image: getAmazonImageUrl("B00I9WWLBA"),
    amazonAsin: "B00I9WWLBA",
    description: "Streak-free shine for mirrors and glass",
  },
  {
    id: "prod_disinfecting_wipes",
    name: "Clorox Disinfecting Wipes (225 ct)",
    category: "Cleaning",
    price: 15.99,
    image: getAmazonImageUrl("B08FRSLHWD"),
    amazonAsin: "B08FRSLHWD",
    description: "Kills 99.9% of bacteria and viruses",
  },
  {
    id: "prod_mop_refills",
    name: "Swiffer PowerMop Refills (16 ct)",
    category: "Cleaning",
    price: 24.99,
    image: getAmazonImageUrl("B09YY71F1Q"),
    amazonAsin: "B09YY71F1Q",
    description: "All-in-one mopping pad refills",
  },
  // Paper Products
  {
    id: "prod_paper_towels",
    name: "Bounty Paper Towels (12 rolls)",
    category: "Paper Products",
    price: 34.99,
    image: getAmazonImageUrl("B0CBWQBRRY"),
    amazonAsin: "B0CBWQBRRY",
    description: "2X more absorbent select-a-size",
  },
  {
    id: "prod_trash_bags",
    name: "Glad Trash Bags 13 Gal (120 ct)",
    category: "Paper Products",
    price: 19.99,
    image: getAmazonImageUrl("B0BZ25VDPL"),
    amazonAsin: "B0BZ25VDPL",
    description: "ForceFlex with Febreze freshness",
  },
  {
    id: "prod_tissues",
    name: "Kleenex Facial Tissues (12 boxes)",
    category: "Paper Products",
    price: 22.99,
    image: getAmazonImageUrl("B08JPRZ79D"),
    amazonAsin: "B08JPRZ79D",
    description: "Soft, strong, and absorbent",
  },
  // Linens
  {
    id: "prod_towels",
    name: "Utopia Towels 8-Piece Set",
    category: "Linens",
    price: 36.99,
    image: getAmazonImageUrl("B00IXNN5UE"),
    amazonAsin: "B00IXNN5UE",
    description: "Premium cotton bath towels, white",
  },
  {
    id: "prod_sheets",
    name: "Amazon Basics Bed Sheet Set (Queen)",
    category: "Linens",
    price: 24.99,
    image: getAmazonImageUrl("B06XSCYVX5"),
    amazonAsin: "B06XSCYVX5",
    description: "Soft microfiber, wrinkle resistant",
  },
  {
    id: "prod_pillows",
    name: "Beckham Hotel Pillows (2 pack)",
    category: "Linens",
    price: 49.99,
    image: getAmazonImageUrl("B01LYNW421"),
    amazonAsin: "B01LYNW421",
    description: "Gel-filled, cooling, Queen size",
  },
  {
    id: "prod_mattress_protector",
    name: "Utopia Bedding Mattress Protector",
    category: "Linens",
    price: 17.99,
    image: getAmazonImageUrl("B00SHLL1Q6"),
    amazonAsin: "B00SHLL1Q6",
    description: "Waterproof, fitted, Queen size",
  },
  // Kitchen
  {
    id: "prod_coffee",
    name: "Keurig K-Cup Variety Pack (40 ct)",
    category: "Kitchen",
    price: 26.99,
    image: getAmazonImageUrl("B0BXQYL6KV"),
    amazonAsin: "B0BXQYL6KV",
    description: "Popular coffee brands sampler",
  },
  {
    id: "prod_dish_soap",
    name: "Dawn Dish Soap (3 pack)",
    category: "Kitchen",
    price: 14.99,
    image: getAmazonImageUrl("B08R9Z3L39"),
    amazonAsin: "B08R9Z3L39",
    description: "Ultra concentrated, cuts grease",
  },
  {
    id: "prod_dishwasher_pods",
    name: "Cascade Dishwasher Pods (62 ct)",
    category: "Kitchen",
    price: 18.99,
    image: getAmazonImageUrl("B0C5ZJQ9CX"),
    amazonAsin: "B0C5ZJQ9CX",
    description: "Platinum ActionPacs, no pre-wash",
  },
  {
    id: "prod_sponges",
    name: "Scotch-Brite Sponges (9 pack)",
    category: "Kitchen",
    price: 9.99,
    image: getAmazonImageUrl("B00FHLJQXA"),
    amazonAsin: "B00FHLJQXA",
    description: "Non-scratch scrub sponges",
  },
  // Laundry
  {
    id: "prod_laundry_pods",
    name: "Tide Pods Laundry Detergent (81 ct)",
    category: "Laundry",
    price: 27.99,
    image: getAmazonImageUrl("B084QDNKZL"),
    amazonAsin: "B084QDNKZL",
    description: "3-in-1 clean, fresh scent",
  },
  {
    id: "prod_dryer_sheets",
    name: "Downy Fabric Softener Sheets (240 ct)",
    category: "Laundry",
    price: 11.99,
    image: getAmazonImageUrl("B07PR6F1GX"),
    amazonAsin: "B07PR6F1GX",
    description: "April fresh, reduces static",
  },
];

export async function GET() {
  const categories = [...new Set(products.map((p) => p.category))];

  return NextResponse.json({
    products,
    categories,
    amazonAssociateTag: AMAZON_ASSOCIATE_TAG,
  });
}
