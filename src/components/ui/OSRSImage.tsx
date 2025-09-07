"use client";

import { Image, type ImageProps } from "@mantine/core";
import { getCropById } from "@/lib/farming-data-simple";
import { getPurchasableItemById } from "@/lib/purchasable-items";

interface OSRSImageProps extends Omit<ImageProps, "src" | "alt"> {
  /**
   * The crop ID or purchasable item ID to display the image for
   */
  itemId: string;
  /**
   * Whether this is a purchasable item (will look in purchasable-items.json)
   * If false, will look in crops.json
   */
  isPurchasable?: boolean;
  /**
   * The type of image to display for crops: 'seed' or 'crop'
   * Only applies when isPurchasable is false
   */
  imageType?: "seed" | "crop";
  /**
   * Override the alt text. If not provided, will use the item name
   */
  alt?: string;
  /**
   * Size of the image (width and height will be the same)
   */
  size?: number;
}

/**
 * Shared component for displaying OSRS item and crop images
 * Automatically fetches the correct image URL from either crops.json or purchasable-items.json
 */
export function OSRSImage({
  itemId,
  isPurchasable = false,
  imageType = "crop",
  alt,
  size = 32,
  ...imageProps
}: OSRSImageProps) {
  let imageSrc: string;
  let imageAlt: string;

  if (isPurchasable) {
    // Extract the clean item ID by removing " (purchasable)" suffix if present
    const cleanItemId = itemId.replace(" (purchasable)", "").trim();
    const purchasableItem = getPurchasableItemById(cleanItemId);

    imageSrc =
      purchasableItem?.images?.item ||
      "https://oldschool.runescape.wiki/images/0/0a/Placeholder_item.png";
    imageAlt = alt || purchasableItem?.name || cleanItemId;
  } else {
    // Convert itemId to lowercase for crop lookup since crop IDs are lowercase in the JSON
    const cropId = itemId.toLowerCase();
    const cropData = getCropById(cropId);

    // Choose between seed and crop image based on imageType
    imageSrc =
      imageType === "seed"
        ? cropData?.images?.seed ||
          "https://oldschool.runescape.wiki/images/0/0a/Seed_placeholder.png"
        : cropData?.images?.crop ||
          "https://oldschool.runescape.wiki/images/0/0a/Crop_placeholder.png";
    imageAlt = alt || cropData?.name || itemId;
  }

  return (
    <Image
      src={imageSrc}
      alt={imageAlt}
      w={size}
      h={size}
      fit="contain"
      fallbackSrc={
        isPurchasable
          ? "https://oldschool.runescape.wiki/images/0/0a/Placeholder_item.png"
          : imageType === "seed"
            ? "https://oldschool.runescape.wiki/images/0/0a/Seed_placeholder.png"
            : "https://oldschool.runescape.wiki/images/0/0a/Crop_placeholder.png"
      }
      {...imageProps}
    />
  );
}
