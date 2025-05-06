import { Schema, model } from "mongoose";

export interface BoardInterface extends Document {
  id: string;
  name: string;
  slug: string;
  color: string;
  initials: string;
  active: boolean;
  createdAt: Date;
}


export const Board = model<BoardInterface>('Board', new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  initials: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false, // ?elimina el campo __v
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
}));