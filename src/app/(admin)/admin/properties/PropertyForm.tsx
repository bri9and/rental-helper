'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Bed, Bath, ChefHat, Sofa, UtensilsCrossed, WashingMachine, Car, TreePine, Minus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label
} from "@/components/ui";
import { createProperty, updateProperty, PropertyFormData } from "@/lib/actions/properties";
import { IProperty, IInventorySetting, IRoomConfiguration } from "@/models/Property";
import { IWarehouseItem } from "@/models/WarehouseItem";

const defaultRooms: IRoomConfiguration = {
  bedrooms: 1,
  bathrooms: 1,
  halfBathrooms: 0,
  kitchens: 1,
  livingRooms: 1,
  diningRooms: 0,
  laundryRooms: 0,
  garages: 0,
  outdoorSpaces: 0,
};

const roomConfig = [
  { key: 'bedrooms', label: 'Bedrooms', icon: Bed, color: 'text-purple-600' },
  { key: 'bathrooms', label: 'Full Baths', icon: Bath, color: 'text-blue-600' },
  { key: 'halfBathrooms', label: 'Half Baths', icon: Bath, color: 'text-blue-400' },
  { key: 'kitchens', label: 'Kitchens', icon: ChefHat, color: 'text-orange-600' },
  { key: 'livingRooms', label: 'Living Rooms', icon: Sofa, color: 'text-emerald-600' },
  { key: 'diningRooms', label: 'Dining Rooms', icon: UtensilsCrossed, color: 'text-amber-600' },
  { key: 'laundryRooms', label: 'Laundry', icon: WashingMachine, color: 'text-cyan-600' },
  { key: 'garages', label: 'Garages', icon: Car, color: 'text-zinc-600' },
  { key: 'outdoorSpaces', label: 'Outdoor', icon: TreePine, color: 'text-green-600' },
] as const;

interface PropertyFormProps {
  property?: IProperty & { _id: string };
  availableItems: IWarehouseItem[];
}

export function PropertyForm({ property, availableItems }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<IRoomConfiguration>(
    property?.rooms ?? defaultRooms
  );
  const [inventorySettings, setInventorySettings] = useState<IInventorySetting[]>(
    property?.inventorySettings ?? []
  );

  const isEditing = !!property;

  const handleRoomChange = (key: keyof IRoomConfiguration, delta: number) => {
    setRooms(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const handleAddItem = () => {
    if (availableItems.length === 0) return;

    // Find an item that's not already added
    const unusedItem = availableItems.find(
      (item) => !inventorySettings.some((s) => s.itemSku === item.sku)
    );

    if (!unusedItem) {
      setError("All items have been added");
      return;
    }

    setInventorySettings([
      ...inventorySettings,
      { itemSku: unusedItem.sku, parLevel: unusedItem.parLevel },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setInventorySettings(inventorySettings.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof IInventorySetting, value: string | number) => {
    const updated = [...inventorySettings];
    updated[index] = { ...updated[index], [field]: value };
    setInventorySettings(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: PropertyFormData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      rooms,
      inventorySettings,
    };

    const result = isEditing
      ? await updateProperty(property._id, data)
      : await createProperty(data);

    setLoading(false);

    if (result.success) {
      router.push("/admin/properties");
    } else {
      setError(result.error || "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Property" : "New Property"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Lake House"
                defaultValue={property?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="e.g., 123 Main St, City, State"
                defaultValue={property?.address}
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Room Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {roomConfig.map(({ key, label, icon: Icon, color }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <span className="text-sm font-medium text-zinc-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRoomChange(key, -1)}
                      disabled={rooms[key] === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-zinc-900">
                      {rooms[key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRoomChange(key, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory Requirements</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddItem}
              disabled={availableItems.length === 0 || inventorySettings.length >= availableItems.length}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            {availableItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-zinc-500">
                  No inventory items available.{" "}
                  <a href="/admin/inventory/new" className="text-emerald-700 hover:underline">
                    Add items to your warehouse
                  </a>{" "}
                  first.
                </p>
              </div>
            ) : inventorySettings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-zinc-500">
                  No inventory requirements set. Click &quot;Add Item&quot; to specify what this property needs.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inventorySettings.map((setting, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4"
                  >
                    <div className="flex-1">
                      <Label htmlFor={`item-${index}`}>Item</Label>
                      <select
                        id={`item-${index}`}
                        value={setting.itemSku}
                        onChange={(e) => handleItemChange(index, "itemSku", e.target.value)}
                        className="mt-1 flex h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        {availableItems.map((item) => (
                          <option
                            key={item.sku}
                            value={item.sku}
                            disabled={
                              inventorySettings.some(
                                (s, i) => s.itemSku === item.sku && i !== index
                              )
                            }
                          >
                            {item.name} ({item.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <Label htmlFor={`par-${index}`}>Par Level</Label>
                      <Input
                        id={`par-${index}`}
                        type="number"
                        min="1"
                        value={setting.parLevel}
                        onChange={(e) =>
                          handleItemChange(index, "parLevel", Number(e.target.value))
                        }
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="mt-6 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/properties")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Property"}
          </Button>
        </div>
      </div>
    </form>
  );
}
