import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ensure no duplicate emails
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
); // adds createdAt and updatedAt automatically

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;
