import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CleanerInvitation, { generateInvitationCode } from '@/models/CleanerInvitation';
import Cleaner from '@/models/Cleaner';
import { getAuthUserId } from '@/lib/auth';

// GET - List all invitations for the current manager
export async function GET() {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitations = await CleanerInvitation.find({ managerId: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get cleaners for this manager
    const cleaners = await Cleaner.find({ managerId: userId })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        id: inv._id.toString(),
        code: inv.code,
        status: inv.status,
        cleanerName: inv.cleanerName,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
      cleaners: cleaners.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        lastActiveAt: c.lastActiveAt,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('[API] Get invitations failed:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

// POST - Create a new invitation
export async function POST() {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a unique code
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateInvitationCode();
      const existing = await CleanerInvitation.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique code' },
        { status: 500 }
      );
    }

    // Create invitation that expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await CleanerInvitation.create({
      managerId: userId,
      code,
      status: 'pending',
      expiresAt,
    });

    return NextResponse.json({
      invitation: {
        id: invitation._id.toString(),
        code: invitation.code,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error) {
    console.error('[API] Create invitation failed:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
