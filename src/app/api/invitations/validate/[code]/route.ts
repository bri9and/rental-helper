import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import CleanerInvitation from '@/models/CleanerInvitation';

interface RouteParams {
  params: Promise<{ code: string }>;
}

// GET - Validate an invitation code (no auth required - this is for cleaners)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { code } = await params;

    const invitation = await CleanerInvitation.findOne({
      code: code.toUpperCase(),
    });

    if (!invitation) {
      return NextResponse.json(
        { valid: false, error: 'Invalid invitation code' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({
        valid: false,
        error: invitation.status === 'accepted'
          ? 'This invitation has already been used'
          : invitation.status === 'expired'
          ? 'This invitation has expired'
          : 'This invitation is no longer valid',
      });
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      invitation.status = 'expired';
      await invitation.save();
      return NextResponse.json({
        valid: false,
        error: 'This invitation has expired',
      });
    }

    return NextResponse.json({
      valid: true,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error('[API] Validate invitation failed:', error);
    return NextResponse.json({ error: 'Failed to validate invitation' }, { status: 500 });
  }
}
