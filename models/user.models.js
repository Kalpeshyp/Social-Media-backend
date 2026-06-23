import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  userName: {
    type: String, default: "",
    unique: true
  },
  email: {
    type: String, default: "",
    unique: true
  },
  active: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  token: {
    type: String,
    default: "",
  },
});


const User = mongoose.model("User", userSchema);

export default User;