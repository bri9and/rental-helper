/**
 * Set a user as superAdmin in Clerk
 *
 * Usage:
 *   npx tsx scripts/set-super-admin.ts <user_id>
 *
 * Example:
 *   npx tsx scripts/set-super-admin.ts user_386HVlYdKRRJsxiIsbOdAKHWUC8
 *
 * You can also set via Clerk Dashboard:
 * 1. Go to dashboard.clerk.com
 * 2. Select your app → Users
 * 3. Click on the user
 * 4. Go to "Metadata" section
 * 5. Under "Public metadata", add: { "role": "superAdmin" }
 */

import { createClerkClient } from '@clerk/backend';

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('Usage: npx tsx scripts/set-super-admin.ts <user_id>');
    console.error('');
    console.error('Example: npx tsx scripts/set-super-admin.ts user_386HVlYdKRRJsxiIsbOdAKHWUC8');
    process.exit(1);
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('Error: CLERK_SECRET_KEY environment variable is required');
    console.error('');
    console.error('Set it with: export CLERK_SECRET_KEY=sk_...');
    process.exit(1);
  }

  const clerk = createClerkClient({ secretKey });

  try {
    console.log(`Setting superAdmin role for user: ${userId}`);

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'superAdmin',
      },
    });

    console.log('Success! User is now a superAdmin.');
    console.log('');
    console.log('Note: The user may need to sign out and back in for the role to take effect.');
  } catch (error) {
    console.error('Failed to update user metadata:', error);
    process.exit(1);
  }
}

main();
