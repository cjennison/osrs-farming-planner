import purchasableItemsData from "@/data/purchasable-items.json";

// Types for purchasable items
export interface PurchasableItem {
  id: string;
  name: string;
  itemId: number;
  wikiUrl: string;
  category: string;
  type: string;
  images: {
    item: string;
  };
  shopInfo?: {
    available: boolean;
    locations: Array<{
      shop: string;
      price: number;
      stock: string;
    }>;
  };
  uses?: string[];
  aliases?: string[];
  containerInfo?: {
    size?: number;
    itemContained?: string;
    isContainer?: boolean;
    containerName?: string;
    containerSize?: number;
    containerItemId?: number;
  };
}

export interface PurchasableItemsDatabase {
  metadata: {
    lastUpdated: string;
    version: string;
    source: string;
  };
  items: Record<string, PurchasableItem>;
}

// Type-safe access to the data
const database = purchasableItemsData as unknown as PurchasableItemsDatabase;

/**
 * Get all purchasable items
 */
export function getAllPurchasableItems(): PurchasableItem[] {
  return Object.values(database.items);
}

/**
 * Get a purchasable item by ID
 */
export function getPurchasableItemById(
  id: string,
): PurchasableItem | undefined {
  return database.items[id];
}

/**
 * Get a purchasable item by name or alias
 */
export function getPurchasableItemByName(
  name: string,
): PurchasableItem | undefined {
  const normalizedName = name.toLowerCase();
  return Object.values(database.items).find(
    (item) =>
      item.name.toLowerCase() === normalizedName ||
      item.aliases?.some((alias) => alias.toLowerCase() === normalizedName),
  );
}

/**
 * Map item names to crop IDs for container items
 */
export function mapItemToCrop(itemName: string): string {
  const item = getPurchasableItemByName(itemName);

  // For container items, return the item ID (which matches crop ID)
  if (item?.containerInfo?.isContainer) {
    return item.id;
  }

  // Handle legacy containerInfo structure if it exists
  if (item?.containerInfo?.itemContained) {
    return item.containerInfo.itemContained;
  }

  // Fallback mappings for common container items
  const itemToCropMap: Record<string, string> = {
    "sack of potatoes": "potato",
    "sack of onions": "onion",
    "sack of cabbages": "cabbage",
    "basket of tomatoes": "tomato",
    "basket of apples": "apple",
  };

  return itemToCropMap[itemName.toLowerCase()] || itemName;
}

/**
 * Get purchasable items by category
 */
export function getPurchasableItemsByCategory(
  category: string,
): PurchasableItem[] {
  return Object.values(database.items).filter(
    (item) => item.category === category,
  );
}

/**
 * Check if an item name refers to a purchasable item
 */
export function isPurchasableItem(itemName: string): boolean {
  return getPurchasableItemByName(itemName) !== undefined;
}
