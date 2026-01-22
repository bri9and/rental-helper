export const dynamic = 'force-dynamic';

import { ExternalLink, Package, ShoppingBag, Sparkles, Shirt, Coffee, WashingMachine, Bath, Scroll, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, Button } from "@/components/ui";
import { getAmazonUrl } from "@/lib/amazon";
import { getProducts, getCategories, seedDefaultProducts } from "@/lib/actions/products";
import { IProduct } from "@/models/Product";

// Category icons for section headers
const categoryConfig: Record<string, { icon: React.ElementType; iconColor: string }> = {
  Toiletries: { icon: Bath, iconColor: "text-blue-500" },
  Cleaning: { icon: Sparkles, iconColor: "text-purple-500" },
  "Paper Products": { icon: Scroll, iconColor: "text-amber-500" },
  Linens: { icon: Shirt, iconColor: "text-pink-500" },
  Kitchen: { icon: Coffee, iconColor: "text-orange-500" },
  Laundry: { icon: WashingMachine, iconColor: "text-cyan-500" },
};

function getProductImageUrl(product: IProduct): string {
  if (product.imageUrl) return product.imageUrl;
  if (product.amazonAsin) return `/products/${product.amazonAsin}.png`;
  return '/products/default.png';
}

export default async function ShopSuppliesPage() {
  // Seed default products if needed
  await seedDefaultProducts();

  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Shop Supplies</h1>
          <p className="text-sm md:text-base text-zinc-500">
            Restock your rental properties with quality supplies
          </p>
        </div>
        <Link href="/admin/shop/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const config = categoryConfig[category];
        const CategoryIcon = config?.icon || ShoppingBag;
        const categoryProducts = products.filter((p) => p.category === category);

        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-3">
              <CategoryIcon className={`h-5 w-5 ${config?.iconColor || 'text-zinc-500'}`} />
              <h2 className="text-lg font-semibold text-zinc-800">{category}</h2>
              <span className="text-sm text-zinc-400">({categoryProducts.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
              {categoryProducts.map((product) => (
                <Card key={product.sku} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative bg-white">
                    <Image
                      src={getProductImageUrl(product)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {!product.isDefault && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-zinc-900 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {product.price ? (
                        <span className="text-lg font-bold text-zinc-900">
                          ${product.price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-400">No price</span>
                      )}
                    </div>
                    {product.amazonAsin ? (
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
                    ) : (
                      <div className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-500">
                        <Package className="h-4 w-4" />
                        No link available
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      {products.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No products yet
            </h3>
            <p className="mt-1 text-zinc-500">
              Add your first product to get started.
            </p>
            <Link href="/admin/shop/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Affiliate Disclosure */}
      <p className="text-xs text-zinc-400 text-center pt-4 border-t border-zinc-200">
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
    </div>
  );
}
