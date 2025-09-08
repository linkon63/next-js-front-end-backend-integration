"use client";

import { Product } from "@/lib/types/product";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useCartStore } from "@/app/store/cartStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// handle price coming as Prisma.Decimal | string | number
function formatPrice(value: any): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  // Prisma.Decimal has toString()
  if (typeof value.toString === "function") return value.toString();
  try {
    return String(value);
  } catch {
    return "";
  }

function toNumberPrice(value: any): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  try {
    const s = value.toString?.() ?? String(value);
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}
}

export default function ProductDetails({ product }: { product: Product }) {
  const cover =
    product.images?.find((i: any) => i.isFeatured)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    "/next.svg";

  // Variants
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [mainImage, setMainImage] = useState(cover);

  // Compute a fallback price from variants (min price) since Product has no direct price field
  const variantPrices: number[] = Array.isArray(variants)
    ? variants
        .map((v: any) => {
          const n = Number(v?.price);
          return isNaN(n) ? undefined : n;
        })
        .filter((n: number | undefined): n is number => n != null)
    : [];
  const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : 0;

  type CartItem = { id: string; name: string; price: any; sku?: string };

  const getCartItem = (): CartItem | null => {
    // Only allow cart items when a variant is explicitly selected
    if (variants.length === 0) return null;
    if (!selectedVariant) return null;
    return {
      id: selectedVariant.id,
      name: product.name,
      price: selectedVariant.price,
      sku: (selectedVariant as any)?.sku,
    };
  };

  const handleAddToCart = () => {
    const item = getCartItem();
    if (!item) return alert("Please select a variant.");
    const addToCart = useCartStore.getState().addToCart;
    addToCart({
      id: item.id,
      name: item.name,
      price: toNumberPrice(item.price),
      quantity: 1,
    });
    // Optionally show a confirmation or toast here
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return alert("Please select a variant.");
    alert(`Proceeding to checkout for ${product.name} (${selectedVariant.sku}).`);
  };

  const handleWishlist = () => {
    alert(`Toggled wishlist for ${product.name}`);
  };

  const canAddOrBuy = variants.length > 0 && !!selectedVariant;

  // Fake reviews
  const reviews = [
    { id: "r1", user: "Alice", rating: 5, comment: "Excellent quality!", date: "2025-08-12" },
    { id: "r2", user: "Bob", rating: 4, comment: "Great value for money.", date: "2025-08-27" },
  ];
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  // Recommended products (demo)
  const recommended = [
    { id: "rec-1", name: "Nike Air Zoom", price: 550, imageUrl: cover },
    { id: "rec-2", name: "Adidas Run Lite", price: 420, imageUrl: cover },
  ];

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
        {/* Images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex flex-col gap-3 w-20">
              {product.images.map((img: any) => (
                <div
                  key={img.id}
                  className={`relative w-20 h-20 border rounded-md cursor-pointer ${
                    mainImage === img.imageUrl ? "ring-2 ring-black" : ""
                  }`}
                  onClick={() => setMainImage(img.imageUrl)}
                >
                  <Image src={img.imageUrl} alt={product.name} fill className="object-contain p-2" />
                </div>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="relative flex-1 aspect-square bg-gray-50 rounded-lg">
            <Image src={mainImage} alt={product.name} fill className="object-contain p-4" />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          {product.brand?.name && <p className="text-sm text-gray-500">Brand: {product.brand.name}</p>}
          {product.category?.name && <p className="text-sm text-gray-500">Category: {product.category.name}</p>}

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-yellow-500">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
            <span className="text-sm text-gray-600">
              {avgRating.toFixed(1)} / 5 ({reviews.length} reviews)
            </span>
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium">Select Variant</h3>
              <div className="flex flex-wrap gap-3 mt-2">
                {variants.map((v: any) => (
                  <Button
                    key={v.id}
                    variant={selectedVariant?.id === v.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.sku} — ${formatPrice(v.price)} ({v.stockQuantity} in stock)
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          {selectedVariant && (
            <p className="mt-4 text-2xl font-bold text-gray-900">${formatPrice(selectedVariant.price)}</p>
          )}

          {/* Description */}
          {product.description && (
            <p className="mt-4 text-sm text-gray-700">{product.description}</p>
          )}

          {/* Availability / Selection notice */}
          {!variants.length && (
            <p className="mt-4 text-sm text-red-600">This product is currently unavailable (no variants).</p>
          )}
          {variants.length > 0 && !selectedVariant && (
            <p className="mt-4 text-sm text-amber-600">Please select a variant to proceed.</p>
          )}

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleAddToCart} className="bg-black hover:bg-gray-800 disabled:opacity-50" disabled={!canAddOrBuy} title={!canAddOrBuy ? "Select a variant first" : undefined}>
              🛒 Add to Cart
            </Button>
            <Button onClick={handleBuyNow} className="bg-green-600 hover:bg-green-700 disabled:opacity-50" disabled={!canAddOrBuy} title={!canAddOrBuy ? "Select a variant first" : undefined}>
              ⚡ Buy Now
            </Button>
            <Button variant="outline" onClick={handleWishlist}>
              ♡ Wishlist
            </Button>
          </div>
        </div>
      </div>

     {/* Reviews */}
     <section className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Customer Reviews</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <span className="font-medium">{r.user}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(r.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-yellow-500">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <p className="mt-2 text-sm">{r.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold mb-4">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommended.map((p) => (
            <Card key={p.id} className="group hover:shadow-md transition">
              <Link href={`/products/${p.id}`}>
                <div className="relative w-full aspect-square bg-gray-50">
                  <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-4" />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium group-hover:underline">{p.name}</p>
                  <p className="text-sm text-gray-900">${p.price}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
