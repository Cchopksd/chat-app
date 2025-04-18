import { Document, model, Schema } from "mongoose";

export interface IChatRoom extends Document {
  name: string;
  members: string[];
  isPrivate: boolean;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }], //TODO: Suspense later migration 
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ChatRoomModel = model<IChatRoom>("ChatRoom", chatRoomSchema);

