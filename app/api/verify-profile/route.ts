import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(token);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    return NextResponse.json({
      isComplete: !!(userData?.displayName && userData?.role),
      userData
    });
  } catch (error) {
    console.error('Profile verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
} 