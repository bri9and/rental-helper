'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label
} from "@/components/ui";
import { createProduct } from "@/lib/actions/products";

const CATEGORIES = [
  "Toiletries",
  "Cleaning",
  "Paper Products",
  "Linens",
  "Kitchen",
  "Laundry",
  "Other",
];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createProduct({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      category: formData.get("category") as string,
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : undefined,
      amazonAsin: (formData.get("amazonAsin") as string) || undefined,
      imageUrl: (formData.get("imageUrl") as string) || undefined,
      sku: formData.get("sku") as string,
    });

    setLoading(false);

    if (result.success) {
      router.push("/admin/shop");
    } else {
      setError(result.error || "An error occurred");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/shop" className="p-2 hover:bg-zinc-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Add Product</h1>
          <p className="text-zinc-500">Add a custom product to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Luxury Bath Towels"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="e.g., TOWEL-LUX-01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Brief description of the product"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="flex h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amazonAsin">Amazon ASIN</Label>
              <Input
                id="amazonAsin"
                name="amazonAsin"
                placeholder="e.g., B08JQN3S9J (optional - for Amazon link)"
              />
              <p className="text-xs text-zinc-500">
                Find the ASIN in the product URL on Amazon (e.g., amazon.com/dp/<strong>B08JQN3S9J</strong>)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg (optional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/shop")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
