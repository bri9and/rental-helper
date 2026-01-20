// Amazon Associate Tag
export const AMAZON_ASSOCIATE_TAG = "rentalhelper-20";

/**
 * Generate Amazon product URL with affiliate tag and quantity
 */
export function getAmazonUrl(asin: string, qty: number = 1): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}&qty=${qty}`;
}

/**
 * Generate Amazon cart URL for bulk purchases with affiliate tag
 */
export function getAmazonCartUrl(items: { asin: string; qty: number }[]): string {
  const params = items
    .map((item, i) => `ASIN.${i + 1}=${item.asin}&Quantity.${i + 1}=${item.qty}`)
    .join('&');
  return `https://www.amazon.com/gp/aws/cart/add.html?${params}&tag=${AMAZON_ASSOCIATE_TAG}`;
}
