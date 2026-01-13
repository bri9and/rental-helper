import { resend, isResendConfigured } from './resend';
import {
  generateLowStockEmailHtml,
  generateLowStockEmailText,
  LowStockItem,
} from './templates';

export interface SendRestockAlertParams {
  toEmail: string;
  propertyName: string;
  items: LowStockItem[];
}

export interface SendAlertResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a low stock alert email via Resend
 *
 * Called when warehouse items fall below their low stock threshold
 * after a cleaning report is submitted.
 */
export async function sendRestockAlert(
  params: SendRestockAlertParams
): Promise<SendAlertResult> {
  // Check if Resend is configured
  if (!isResendConfigured() || !resend) {
    console.log('[Email] Resend not configured, skipping alert email');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const emailData = {
      propertyName: params.propertyName,
      items: params.items,
      reportDate: new Date(),
    };

    const { data, error } = await resend.emails.send({
      from: 'StockBnB <alerts@stockbnb.com>', // Update with your verified domain
      to: params.toEmail,
      subject: `🚨 Low Stock Alert: ${params.items.length} item${params.items.length > 1 ? 's' : ''} need restocking`,
      html: generateLowStockEmailHtml(emailData),
      text: generateLowStockEmailText(emailData),
    });

    if (error) {
      console.error('[Email] Failed to send alert:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[Email] Low stock alert sent:', data?.id);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[Email] Error sending alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a critical shortage alert email
 *
 * Called when a property cannot be fully restocked due to
 * insufficient warehouse inventory.
 */
export async function sendShortageAlert(params: {
  toEmail: string;
  propertyName: string;
  shortageItems: Array<{
    name: string;
    sku: string;
    needed: number;
    available: number;
  }>;
}): Promise<SendAlertResult> {
  if (!isResendConfigured() || !resend) {
    console.log('[Email] Resend not configured, skipping shortage alert');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const itemsList = params.shortageItems
      .map((item) => `• ${item.name}: needed ${item.needed}, only ${item.available} available`)
      .join('\n');

    const { data, error } = await resend.emails.send({
      from: 'StockBnB <alerts@stockbnb.com>',
      to: params.toEmail,
      subject: `🔴 CRITICAL: Inventory shortage at ${params.propertyName}`,
      text: `
CRITICAL INVENTORY SHORTAGE

Property: ${params.propertyName}
Time: ${new Date().toLocaleString()}

The following items could not be fully restocked:

${itemsList}

Immediate action required to restock the warehouse.

---
StockBnB Automated Alert
      `.trim(),
    });

    if (error) {
      console.error('[Email] Failed to send shortage alert:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Error sending shortage alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
