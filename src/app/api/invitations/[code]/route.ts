import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import CleanerInvitation from '@/models/CleanerInvitation';
import { getAuthUserId } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ code: string }>;
}

// DELETE - Revoke an invitation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;

    const invitation = await CleanerInvitation.findOne({
      code: code.toUpperCase(),
      managerId: userId,
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Cannot revoke an accepted invitation' },
        { status: 400 }
      );
    }

    invitation.status = 'revoked';
    await invitation.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Revoke invitation failed:', error);
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
  }
}
