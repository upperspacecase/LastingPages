import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';
import { sampleBooks } from '@/utils/sampleData';

// POST /api/books/seed — seed demo data
export async function POST() {
    try {
        await dbConnect();

        // Check if books already exist
        const count = await Book.countDocuments();
        if (count > 0) {
            return NextResponse.json({ message: 'Books already seeded', count });
        }

        // Transform sample data to match schema (_id instead of id)
        const docs = sampleBooks.map((book) => ({
            _id: book.id,
            title: book.title,
            author: book.author,
            coverColor: book.coverColor,
            coverAccent: book.coverAccent,
            coverImage: book.coverImage,
            dateAdded: book.dateAdded,
            lastRevisited: book.lastRevisited,
            notes: book.notes,
            concepts: book.concepts.map((c) => ({
                _id: c.id,
                bookId: c.bookId,
                text: c.text,
                context: c.context,
                personalNote: c.personalNote,
                dateAdded: c.dateAdded,
                lastRevisited: c.lastRevisited,
                timesRevisited: c.timesRevisited,
                retentionDays: c.retentionDays,
            })),
        }));

        await Book.insertMany(docs);

        return NextResponse.json({ message: 'Seeded successfully', count: docs.length }, { status: 201 });
    } catch (error) {
        console.error('POST /api/books/seed error:', error);
        return NextResponse.json({ error: 'Failed to seed books' }, { status: 500 });
    }
}
