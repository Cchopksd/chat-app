import { Document, model, Schema, Types } from "mongoose";

export interface IChatRoom {
  name?: string;
  members: Types.ObjectId[];
  type: "one_to_one" | "group";
  isPrivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatRoomDocument extends IChatRoom, Document {}

const chatRoomSchema = new Schema<IChatRoomDocument>(
  {
    name: {
      type: String,
      required: function (this: IChatRoomDocument) {
        return this.type === "group";
      },
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    type: {
      type: String,
      enum: ["one_to_one", "group"],
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

chatRoomSchema.index({ type: 1, members: 1 });

export const ChatRoomModel = model<IChatRoomDocument>(
  "ChatRoom",
  chatRoomSchema
);

