import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Cleaner from '@/models/Cleaner';

// GET - Get cleaner session data
export async function GET(request: NextRequest) {
  try {
    const cleanerId = request.headers.get('x-cleaner-id');

    if (!cleanerId) {
      return NextResponse.json({ authenticated: false });
    }

    await dbConnect();

    const cleaner = await Cleaner.findById(cleanerId).lean();

    if (!cleaner || cleaner.status !== 'active') {
      return NextResponse.json({ authenticated: false });
    }

    // Update last active
    await Cleaner.findByIdAndUpdate(cleanerId, { lastActiveAt: new Date() });

    return NextResponse.json({
      authenticated: true,
      cleaner: {
        id: cleaner._id.toString(),
        name: cleaner.name,
        managerId: cleaner.managerId,
      },
    });
  } catch (error) {
    console.error('[API] Get cleaner session failed:', error);
    return NextResponse.json({ authenticated: false });
  }
}
