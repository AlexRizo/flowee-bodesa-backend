import { Schema, model } from "mongoose";

export interface MessageInterface extends Document {
  id: string;
  message: string;
  createdAt: Date;
  author: Schema.Types.ObjectId; //? esto es un string
  request: Schema.Types.ObjectId; //? esto es un string
  files: { secureUrl: string; publicId: string }[];
}


export const Message = model<MessageInterface>('Message', new Schema({
  message: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  request: {
    type: Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
  },
  files: {
    type: [{ secureUrl: String, publicId: String }],
    default: [],
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