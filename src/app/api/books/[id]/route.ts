import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/books/[id]
export async function GET(_request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const book = await Book.findById(id).lean();

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: book._id,
            title: book.title,
            author: book.author,
            type: book.type,
            coverColor: book.coverColor,
            coverAccent: book.coverAccent,
            coverImage: book.coverImage,
            dateAdded: book.dateAdded,
            lastRevisited: book.lastRevisited,
            notes: book.notes,
            concepts: book.concepts.map((c) => ({
                id: c._id,
                bookId: c.bookId,
                text: c.text,
                context: c.context,
                personalNote: c.personalNote,
                skill: c.skill,
                dateAdded: c.dateAdded,
                lastRevisited: c.lastRevisited,
                timesRevisited: c.timesRevisited,
                retentionDays: c.retentionDays,
            })),
        });
    } catch (error) {
        console.error('GET /api/books/[id] error:', error);
        return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
    }
}

// PATCH /api/books/[id] — update book fields
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const book = await Book.findByIdAndUpdate(id, { $set: body }, { new: true });

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH /api/books/[id] error:', error);
        return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
    }
}

// DELETE /api/books/[id]
export async function DELETE(_request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const book = await Book.findByIdAndDelete(id);

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/books/[id] error:', error);
        return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
    }
}
