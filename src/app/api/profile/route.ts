import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

// GET /api/profile — get user profile (first one found, pre-auth)
export async function GET() {
    try {
        await dbConnect();
        const profile = await UserProfile.findOne().lean();

        if (!profile) {
            return NextResponse.json(null);
        }

        return NextResponse.json({
            name: profile.name,
            favoriteBook: profile.favoriteBook,
            interests: profile.interests,
            onboardingCompleted: profile.onboardingCompleted,
        });
    } catch (error) {
        console.error('GET /api/profile error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

// POST /api/profile — create a new profile
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const profile = await UserProfile.create({
            name: body.name,
            favoriteBook: body.favoriteBook || '',
            interests: body.interests || [],
            onboardingCompleted: body.onboardingCompleted ?? true,
        });

        return NextResponse.json({ id: profile._id }, { status: 201 });
    } catch (error) {
        console.error('POST /api/profile error:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }
}

// PATCH /api/profile — update existing profile
export async function PATCH(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const profile = await UserProfile.findOneAndUpdate(
            {},
            { $set: body },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, id: profile._id });
    } catch (error) {
        console.error('PATCH /api/profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
