import mongoose, { Schema, models, model, type Document } from 'mongoose';

export interface IUserProfile extends Document {
    name: string;
    favoriteBook: string;
    interests: string[];
    onboardingCompleted: boolean;
}

const UserProfileSchema = new Schema<IUserProfile>(
    {
        name: { type: String, required: true },
        favoriteBook: { type: String, default: '' },
        interests: { type: [String], default: [] },
        onboardingCompleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const UserProfile =
    (models.UserProfile as mongoose.Model<IUserProfile>) ||
    model<IUserProfile>('UserProfile', UserProfileSchema);

export default UserProfile;
