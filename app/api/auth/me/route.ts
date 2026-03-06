import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    console.log('Session check:', session ? 'Authenticated' : 'Not authenticated');
    
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    return NextResponse.json({ authenticated: true, user: session });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
}
