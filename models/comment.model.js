import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  },
  body: {
    type: String,
    required: true
  },
});

const Comments = mongoose.model("Comments", commentSchema);

export default Comments;
