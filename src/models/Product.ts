import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct {
  ownerId: string | null; // null = system default product, string = user's custom product
  name: string;
  description?: string;
  category: string;
  price?: number;
  amazonAsin?: string;
  imageUrl?: string;
  sku: string;
  isDefault: boolean; // true for system defaults, false for user-added
}

export interface IProductDocument extends IProduct, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    ownerId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    price: { type: Number },
    amazonAsin: { type: String },
    imageUrl: { type: String },
    sku: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ProductSchema.index({ ownerId: 1, category: 1 });
ProductSchema.index({ isDefault: 1 });

// Prevent model recompilation error in development
const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;

// Default products to seed
export const DEFAULT_PRODUCTS: Omit<IProduct, 'ownerId'>[] = [
  // Toiletries
  {
    name: "Amazon Basics Toilet Paper (30 rolls)",
    category: "Toiletries",
    price: 24.99,
    amazonAsin: "B08JQN3S9J",
    sku: "TP-30",
    description: "Soft 2-ply toilet paper, septic safe",
    isDefault: true,
  },
  {
    name: "Method Hand Soap Variety Pack (6 ct)",
    category: "Toiletries",
    price: 29.99,
    amazonAsin: "B09XXWH26T",
    sku: "SOAP-6",
    description: "Naturally derived, biodegradable formula",
    isDefault: true,
  },
  {
    name: "Travel Size Toiletries Kit (24 pcs)",
    category: "Toiletries",
    price: 19.99,
    amazonAsin: "B07PXLQ9QZ",
    sku: "TOIL-KIT-24",
    description: "Shampoo, conditioner, lotion, body wash",
    isDefault: true,
  },
  {
    name: "Dove Body Wash (3 pack)",
    category: "Toiletries",
    price: 17.99,
    amazonAsin: "B0BXJTKG4Z",
    sku: "WASH-3",
    description: "Deep moisture, sensitive skin friendly",
    isDefault: true,
  },
  // Cleaning Supplies
  {
    name: "Mrs. Meyer's Multi-Surface Cleaner (3 ct)",
    category: "Cleaning",
    price: 14.99,
    amazonAsin: "B01MSDP75C",
    sku: "CLEAN-3",
    description: "Plant-derived cleaning ingredients",
    isDefault: true,
  },
  {
    name: "Windex Glass Cleaner (2 pack)",
    category: "Cleaning",
    price: 11.99,
    amazonAsin: "B00I9WWLBA",
    sku: "GLASS-2",
    description: "Streak-free shine for mirrors and glass",
    isDefault: true,
  },
  {
    name: "Clorox Disinfecting Wipes (225 ct)",
    category: "Cleaning",
    price: 15.99,
    amazonAsin: "B08FRSLHWD",
    sku: "WIPES-225",
    description: "Kills 99.9% of bacteria and viruses",
    isDefault: true,
  },
  {
    name: "Swiffer PowerMop Refills (16 ct)",
    category: "Cleaning",
    price: 24.99,
    amazonAsin: "B09YY71F1Q",
    sku: "MOP-16",
    description: "All-in-one mopping pad refills",
    isDefault: true,
  },
  // Paper Products
  {
    name: "Bounty Paper Towels (12 rolls)",
    category: "Paper Products",
    price: 34.99,
    amazonAsin: "B0CBWQBRRY",
    sku: "PTOWEL-12",
    description: "2X more absorbent select-a-size",
    isDefault: true,
  },
  {
    name: "Glad Trash Bags 13 Gal (120 ct)",
    category: "Paper Products",
    price: 19.99,
    amazonAsin: "B0BZ25VDPL",
    sku: "TRASH-120",
    description: "ForceFlex with Febreze freshness",
    isDefault: true,
  },
  {
    name: "Kleenex Facial Tissues (12 boxes)",
    category: "Paper Products",
    price: 22.99,
    amazonAsin: "B08JPRZ79D",
    sku: "TISSUE-12",
    description: "Soft, strong, and absorbent",
    isDefault: true,
  },
  // Linens
  {
    name: "Utopia Towels 8-Piece Set",
    category: "Linens",
    price: 36.99,
    amazonAsin: "B00IXNN5UE",
    sku: "TOWEL-8",
    description: "Premium cotton bath towels, white",
    isDefault: true,
  },
  {
    name: "Amazon Basics Bed Sheet Set (Queen)",
    category: "Linens",
    price: 24.99,
    amazonAsin: "B06XSCYVX5",
    sku: "SHEET-Q",
    description: "Soft microfiber, wrinkle resistant",
    isDefault: true,
  },
  {
    name: "Beckham Hotel Pillows (2 pack)",
    category: "Linens",
    price: 49.99,
    amazonAsin: "B01LYNW421",
    sku: "PILLOW-2",
    description: "Gel-filled, cooling, Queen size",
    isDefault: true,
  },
  {
    name: "Utopia Bedding Mattress Protector",
    category: "Linens",
    price: 17.99,
    amazonAsin: "B00SHLL1Q6",
    sku: "MATTRESS-PROT",
    description: "Waterproof, fitted, Queen size",
    isDefault: true,
  },
  // Kitchen
  {
    name: "Keurig K-Cup Variety Pack (40 ct)",
    category: "Kitchen",
    price: 26.99,
    amazonAsin: "B0BXQYL6KV",
    sku: "COFFEE-40",
    description: "Popular coffee brands sampler",
    isDefault: true,
  },
  {
    name: "Dawn Dish Soap (3 pack)",
    category: "Kitchen",
    price: 14.99,
    amazonAsin: "B08R9Z3L39",
    sku: "DISH-3",
    description: "Ultra concentrated, cuts grease",
    isDefault: true,
  },
  {
    name: "Cascade Dishwasher Pods (62 ct)",
    category: "Kitchen",
    price: 18.99,
    amazonAsin: "B0C5ZJQ9CX",
    sku: "DISHPOD-62",
    description: "Platinum ActionPacs, no pre-wash",
    isDefault: true,
  },
  {
    name: "Scotch-Brite Sponges (9 pack)",
    category: "Kitchen",
    price: 9.99,
    amazonAsin: "B00FHLJQXA",
    sku: "SPONGE-9",
    description: "Non-scratch scrub sponges",
    isDefault: true,
  },
  // Laundry
  {
    name: "Tide Pods Laundry Detergent (81 ct)",
    category: "Laundry",
    price: 27.99,
    amazonAsin: "B084QDNKZL",
    sku: "LAUNDRY-81",
    description: "3-in-1 clean, fresh scent",
    isDefault: true,
  },
  {
    name: "Downy Fabric Softener Sheets (240 ct)",
    category: "Laundry",
    price: 11.99,
    amazonAsin: "B07PR6F1GX",
    sku: "DRYER-240",
    description: "April fresh, reduces static",
    isDefault: true,
  },
];
