import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import CleanerInvitation from '@/models/CleanerInvitation';
import Cleaner from '@/models/Cleaner';

// POST - Accept an invitation (no auth required - this is for cleaners)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { code, name, email, phone } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Atomically find and update the invitation to prevent race conditions
    // This ensures only one request can claim a pending invitation
    const invitation = await CleanerInvitation.findOneAndUpdate(
      {
        code: code.toUpperCase(),
        status: 'pending',
        expiresAt: { $gt: new Date() }, // Not expired
      },
      {
        $set: {
          status: 'accepted',
          cleanerName: trimmedName,
        },
      },
      {
        new: false, // Return the original document to get managerId
      }
    );

    if (!invitation) {
      // Check if code exists but is not pending
      const existingInvitation = await CleanerInvitation.findOne({
        code: code.toUpperCase(),
      });

      if (!existingInvitation) {
        return NextResponse.json(
          { error: 'Invalid invitation code' },
          { status: 404 }
        );
      }

      if (existingInvitation.status === 'accepted') {
        return NextResponse.json(
          { error: 'This invitation has already been used' },
          { status: 400 }
        );
      }

      if (new Date() > existingInvitation.expiresAt) {
        return NextResponse.json(
          { error: 'This invitation has expired' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'This invitation is no longer valid' },
        { status: 400 }
      );
    }

    // Create the cleaner profile
    const cleaner = await Cleaner.create({
      name: trimmedName,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      managerId: invitation.managerId,
      invitationCode: invitation.code,
      status: 'active',
    });

    // Update invitation with cleaner ID
    await CleanerInvitation.findByIdAndUpdate(invitation._id, {
      cleanerId: cleaner._id.toString(),
    });

    return NextResponse.json({
      success: true,
      cleaner: {
        id: cleaner._id.toString(),
        name: cleaner.name,
        managerId: cleaner.managerId,
      },
    });
  } catch (error) {
    console.error('[API] Accept invitation failed:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}
