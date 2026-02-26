import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/books/[id]/concepts — add a concept to a book
export async function POST(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const book = await Book.findByIdAndUpdate(
            id,
            {
                $push: {
                    concepts: {
                        _id: body.id,
                        bookId: body.bookId,
                        text: body.text,
                        context: body.context || '',
                        personalNote: body.personalNote || '',
                        dateAdded: body.dateAdded,
                        lastRevisited: body.lastRevisited || null,
                        timesRevisited: body.timesRevisited || 0,
                        retentionDays: body.retentionDays || 0,
                    },
                },
            },
            { new: true }
        );

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('POST /api/books/[id]/concepts error:', error);
        return NextResponse.json({ error: 'Failed to add concept' }, { status: 500 });
    }
}

// PATCH /api/books/[id]/concepts — update a concept within a book
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { conceptId, ...updates } = body;

        if (!conceptId) {
            return NextResponse.json({ error: 'conceptId is required' }, { status: 400 });
        }

        // Build dynamic update object for nested array element
        const setObj: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            setObj[`concepts.$[elem].${key}`] = value;
        }

        const book = await Book.findByIdAndUpdate(
            id,
            { $set: setObj },
            {
                arrayFilters: [{ 'elem._id': conceptId }],
                new: true,
            }
        );

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH /api/books/[id]/concepts error:', error);
        return NextResponse.json({ error: 'Failed to update concept' }, { status: 500 });
    }
}
