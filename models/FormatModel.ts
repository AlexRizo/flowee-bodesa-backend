import { Schema, model } from "mongoose";

export interface FormatInterface extends Document {
  id: string;
  name: string;
  description: string;
  belongsTo: Schema.Types.ObjectId;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}


export const Format = model<FormatInterface>('Format', new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  belongsTo: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
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