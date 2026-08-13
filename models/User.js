import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    // Clerk user unique identifier
    clerkId: {
      type: String,
      required: [true, 'Clerk user ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    firstName: {
      type: String,
      trim: true,
      default: ''
    },
    lastName: {
      type: String,
      trim: true,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    // User interface preferences
    preferences: {
      theme: {
        type: String,
        enum: ['paper-warm', 'paper-dark', 'retro-sepia'],
        default: 'paper-warm'
      },
      defaultCardsCount: {
        type: Number,
        default: 3,
        min: 1,
        max: 10
      },
      defaultDifficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
