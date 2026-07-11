"use client";
import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  heroImage: string;
  productName: string;
  images?: GalleryImage[];
}

export function ProductGallery({ heroImage, productName, images }: ProductGalleryProps) {
  // Build full image list: hero first, then gallery images (deduplicated)
  const allImages: GalleryImage[] = [];
  if (heroImage) {
    allImages.push({ id: "__hero__", url: heroImage, alt: productName });
  }
  if (images) {
    for (const img of images) {
      if (img.url !== heroImage) {
        allImages.push(img);
      }
    }
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = allImages[activeIndex]?.url ?? "";

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-steel-100 bg-steel-50">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={allImages[activeIndex]?.alt || productName}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-graphite/30">
            Image coming soon
          </div>
        )}
      </div>

      {/* Thumbnails — only show when there are multiple images */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-all duration-200 ${
                i === activeIndex
                  ? "border-cyan ring-2 ring-cyan/30"
                  : "border-steel-100 hover:border-steel-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || productName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
