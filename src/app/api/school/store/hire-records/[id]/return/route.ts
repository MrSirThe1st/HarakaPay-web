// Store feature not implemented - UI commented out
import { NextResponse } from 'next/server';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET() { return NextResponse.json({ error: 'Store feature not implemented' }, { status: 501 }); }
export async function POST() { return NextResponse.json({ error: 'Store feature not implemented' }, { status: 501 }); }
export async function PUT() { return NextResponse.json({ error: 'Store feature not implemented' }, { status: 501 }); }
export async function DELETE() { return NextResponse.json({ error: 'Store feature not implemented' }, { status: 501 }); }
