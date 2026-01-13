export interface LowStockItem {
  name: string;
  sku: string;
  currentQuantity: number;
  lowStockThreshold: number;
  parLevel: number;
}

export interface LowStockEmailData {
  propertyName: string;
  items: LowStockItem[];
  reportDate: Date;
}

export function generateLowStockEmailHtml(data: LowStockEmailData): string {
  const formattedDate = data.reportDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e4e4e7;">
            <strong style="color: #18181b;">${item.name}</strong>
            <br />
            <span style="color: #71717a; font-size: 14px;">SKU: ${item.sku}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e4e4e7; text-align: center;">
            <span style="color: #e11d48; font-weight: 600; font-size: 18px;">${item.currentQuantity}</span>
            <br />
            <span style="color: #71717a; font-size: 12px;">current</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e4e4e7; text-align: center;">
            <span style="color: #71717a; font-size: 18px;">${item.lowStockThreshold}</span>
            <br />
            <span style="color: #71717a; font-size: 12px;">threshold</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e4e4e7; text-align: center;">
            <span style="color: #047857; font-size: 18px;">${item.parLevel}</span>
            <br />
            <span style="color: #71717a; font-size: 12px;">par level</span>
          </td>
        </tr>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Low Stock Alert - StockBnB</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; background-color: #047857; border-radius: 8px;"></div>
        <span style="font-size: 24px; font-weight: 600; color: #18181b;">StockBnB</span>
      </div>
    </div>

    <!-- Alert Card -->
    <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
      <!-- Alert Header -->
      <div style="background-color: #fff1f2; padding: 20px; border-bottom: 1px solid #fecdd3;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="color: #e11d48; font-size: 20px;">⚠️</span>
          </div>
          <div>
            <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #be123c;">
              Low Stock Alert
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #9f1239;">
              ${data.items.length} item${data.items.length > 1 ? 's' : ''} below threshold
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div style="padding: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">
          Following a cleaning report at:
        </p>
        <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #18181b;">
          ${data.propertyName}
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #71717a;">
          ${formattedDate}
        </p>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f4f4f5;">
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase;">Item</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase;">Current</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase;">Threshold</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase;">Par</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <!-- CTA -->
        <div style="margin-top: 24px; text-align: center;">
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #71717a;">
            Restock these items to maintain adequate supply levels.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top: 32px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
        This is an automated alert from StockBnB.
      </p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #a1a1aa;">
        Manage your notification preferences in settings.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateLowStockEmailText(data: LowStockEmailData): string {
  const formattedDate = data.reportDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemList = data.items
    .map(
      (item) =>
        `- ${item.name} (${item.sku}): ${item.currentQuantity} remaining (threshold: ${item.lowStockThreshold})`
    )
    .join('\n');

  return `
LOW STOCK ALERT - StockBnB

Following a cleaning report at ${data.propertyName} on ${formattedDate}, the following items are below their low stock threshold:

${itemList}

Please restock these items to maintain adequate supply levels.

---
This is an automated alert from StockBnB.
  `.trim();
}
