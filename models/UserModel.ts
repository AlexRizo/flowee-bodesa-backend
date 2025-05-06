import { Schema, model } from "mongoose";
import { Role } from "../interfaces/models.interfaces";

export interface UserInterface extends Document {
  id: string;
  avatar: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
  deleted: boolean;
  boards: string[];
  createdAt: Date;
}


export const User = model<UserInterface>('User', new Schema({
  avatar: {
    type: String,
    default: "/images/avatar.webp",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: Role.PUBLISHER, // ? 'ADMIN_DESIGN' | 'ADMIN_PUBLISHER' | 'PUBLISHER' | 'DESIGNER' | 'ADMIN' | 'SUPER_ADMIN
    enum: Object.values(Role),
  },
  active: {
    type: Boolean,
    default: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  boards: [{
    type: Schema.Types.ObjectId,
    ref: 'Board',
  }],
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