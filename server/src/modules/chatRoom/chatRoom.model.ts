import { Document, model, Schema } from "mongoose";

export interface IChatRoom extends Document {
  name: string;
  members: string[];
  isGroup: boolean;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatRoomModel = model<IChatRoom>("ChatRoom", chatRoomSchema);

