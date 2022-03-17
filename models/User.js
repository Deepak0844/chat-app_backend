import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: null,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema, "user");
