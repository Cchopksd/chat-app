import { Document, model, Schema } from "mongoose";

export interface IChatRoom extends Document {
  name: string;
  members: string[];
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const UserModel = model<IChatRoom>("ChatRoom", chatRoomSchema);

