'use client';

import { useState } from "react";
import { Edit, Trash2, MapPin, Package } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge
} from "@/components/ui";
import { IProperty } from "@/models/Property";
import { deleteProperty } from "@/lib/actions/properties";
import Link from "next/link";

interface PropertiesTableProps {
  properties: IProperty[];
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    setLoading(id);
    await deleteProperty(id);
    setLoading(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Inventory Items</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => {
          const id = (property as IProperty & { _id: string })._id;
          const isLoading = loading === id;
          const itemCount = property.inventorySettings?.length ?? 0;

          return (
            <TableRow key={id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <MapPin className="h-5 w-5 text-emerald-700" />
                  </div>
                  <p className="font-medium">{property.name}</p>
                </div>
              </TableCell>
              <TableCell>
                {property.address ? (
                  <span className="text-zinc-600">{property.address}</span>
                ) : (
                  <span className="text-zinc-400">No address</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={itemCount > 0 ? "success" : "default"}>
                  <Package className="mr-1 h-3 w-3" />
                  {itemCount} items
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/properties/${id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(id)}
                    disabled={isLoading}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
