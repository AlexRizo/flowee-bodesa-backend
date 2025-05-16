import { Schema, model } from "mongoose";

export interface RequestInterface extends Document {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  legals: string;
  isAutoAssigned: boolean;
  status: Status;
  type: Type;
  size: string;
  author: Schema.Types.ObjectId;
  board: Schema.Types.ObjectId;
  assignedTo?: Schema.Types.ObjectId;
  referenceFiles: { secureUrl: string, publicId: string }[];
  files: { secureUrl: string, publicId: string }[];
  finishDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum Status {
  AWAITING = 'AWAITING',
  ATTENTION = 'ATTENTION',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING  = 'PENDING',
  DONE = 'DONE',
}

enum Type {
  PRINTED = 'PRINTED',
  DIGITAL = 'DIGITAL',
  ECOMMERCE = 'ECOMMERCE',
  SPECIAL = 'SPECIAL',
}

enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const Request = model<RequestInterface>('Request', new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  type: {
    type: String,
    enum: Type,
    required: true,
    default: Type.SPECIAL,
  },
  legals: {
    type: String,
    required: true,
    maxLength: 500,
  },
  size: {
    type: String,
    required: true,
    maxLength: 100,
  },
  status: {
    type: String,
    enum: Status,
    default: Status.AWAITING,
  },
  priority: {
    type: String,
    enum: Priority,
    default: Priority.LOW,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referenceFiles: {
    type: [{ secureUrl: String, publicId: String }],
    default: [],
  },
  files: {
    type: [{ secureUrl: String, publicId: String }],
    default: [],
  },
  finishDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  isAutoAssigned: {
    type: Boolean,
    default: false,
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