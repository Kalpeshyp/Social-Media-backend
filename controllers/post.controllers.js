import User from "../models/user.models.js";

export const createPost = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newPost = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/") : "",
    });

    await newPost.save();
    return res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "name username email profilePicture",
    );
    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { token } = req.body;
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    await post.deleteOne({ _id: post_id });
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const post = await Post.findOne({ _id: post_id});

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    return res.status(200).json({ comments: post.comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const delete_comment_by_user = async (req, res) => {
  const { token, post_id, comment_id } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findOne({" _id": comment_id });

    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized" });
    }
    if(comment.userId.toString() !== user._id.toString()){
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }
    
    await comment.deleteOne({ _id: comment_id });
    return res.status(200).json({ message: "Comment deleted successfully" });

  }
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  export const increment_likes = async (req, res) => {
    const { token, post_id } = req.body;
    try {
      
      const post = await Post.findOne({ _id: post_id });

      if (!post) {
        return res
          .status(404)
          .json({ message: "Post not found or unauthorized" });
      }
      post.likes += 1;
      await post.save();
      return res.status(200).json({ message: "Post liked successfully" });
      if (post.likes.includes(user._id)) {
        return res.status(400).json({ message: "User has already liked this post" });
      }

    }
      catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
export const activeCheck = async (req, res) => {
  res.status(500).json({ message: message.json });
};
