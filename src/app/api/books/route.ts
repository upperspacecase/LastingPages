import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

// GET /api/books — list all books
export async function GET() {
    try {
        await dbConnect();
        const books = await Book.find({}).lean();

        // Map _id to id for client compatibility
        const mapped = books.map((book) => ({
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
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('GET /api/books error:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}

// POST /api/books — create a new book
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const book = await Book.create({
            _id: body.id,
            title: body.title,
            author: body.author || '',
            type: body.type || 'book',
            coverColor: body.coverColor,
            coverAccent: body.coverAccent,
            coverImage: body.coverImage,
            dateAdded: body.dateAdded,
            lastRevisited: body.lastRevisited || null,
            concepts: (body.concepts || []).map((c: Record<string, unknown>) => ({
                _id: c.id,
                bookId: c.bookId,
                text: c.text,
                context: c.context || '',
                personalNote: c.personalNote || '',
                dateAdded: c.dateAdded,
                lastRevisited: c.lastRevisited || null,
                timesRevisited: c.timesRevisited || 0,
                retentionDays: c.retentionDays || 0,
            })),
            notes: body.notes || '',
        });

        return NextResponse.json({ id: book._id }, { status: 201 });
    } catch (error) {
        console.error('POST /api/books error:', error);
        return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
    }
}
