import mongoose, { Schema, models, model } from 'mongoose';

/* -------------------------------------------------------------------------- */
/*  Concept (subdocument)                                                     */
/* -------------------------------------------------------------------------- */

export interface IConcept {
    _id: string;
    bookId: string;
    text: string;
    context: string;
    personalNote: string;
    dateAdded: string;
    lastRevisited: string | null;
    timesRevisited: number;
    retentionDays: number;
}

const ConceptSchema = new Schema<IConcept>(
    {
        _id: { type: String, required: true },
        bookId: { type: String, required: true },
        text: { type: String, required: true },
        context: { type: String, default: '' },
        personalNote: { type: String, default: '' },
        dateAdded: { type: String, required: true },
        lastRevisited: { type: String, default: null },
        timesRevisited: { type: Number, default: 0 },
        retentionDays: { type: Number, default: 0 },
    },
    { _id: false }
);

/* -------------------------------------------------------------------------- */
/*  Book                                                                      */
/* -------------------------------------------------------------------------- */

export interface IBook {
    _id: string;
    title: string;
    author: string;
    coverColor: string;
    coverAccent: string;
    coverImage?: string;
    dateAdded: string;
    lastRevisited: string | null;
    concepts: IConcept[];
    notes: string;
}

const BookSchema = new Schema<IBook>(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        author: { type: String, default: '' },
        coverColor: { type: String, required: true },
        coverAccent: { type: String, required: true },
        coverImage: { type: String },
        dateAdded: { type: String, required: true },
        lastRevisited: { type: String, default: null },
        concepts: { type: [ConceptSchema], default: [] },
        notes: { type: String, default: '' },
    },
    {
        _id: false,
        timestamps: true,
    }
);

// Prevent model recompilation in dev hot-reload
const Book = (models.Book as mongoose.Model<IBook>) || model<IBook>('Book', BookSchema);

export default Book;
