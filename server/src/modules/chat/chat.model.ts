import { Schema, model, Document, Types } from "mongoose";

export interface IChat extends Document {
  room_id: Types.ObjectId;
  sender_id: Types.ObjectId;
  content: string;
  message_type?: "text" | "image" | "file";
  readBy: string[];
}

const ChatSchema = new Schema<IChat>(
  {
    room_id: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    message_type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const ChatModel = model<IChat>("Chat", ChatSchema);

