import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import profile from "../models/profile.model.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import connectionRequest from "../models/connection.model.js";

const convertUserDataToPdf = (userData) => {
  try {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";

    const stream = fs.createWriteStream(`uploads/${outputPath}`);

    doc.pipe(stream);
    doc.image(`uploads/${userData.userId.profilePicture}`, {
      align: "center",
      width: 100,
    });
    doc.fontSize(14).text(`Name${userData.userId.name}`);
    doc.fontSize(14).text(`username ${userData.userId.username}`);
    doc.fontSize(14).text(`E-mail${userData.userId.email}`);
    doc.text(`Bio: ${userData.bio}`);
    doc.text(`Current Position: ${userData.currentPost}`);
    doc.fontSize(14).text("Past Work : ");
    userData.pastWork.forEach((work, index) => {
      doc.fontSize(14).text(`Company Name${work.company}`);
      doc.fontSize(14).text(`Position ${work.position}`);
      doc.fontSize(14).text(`Years ${work.years}`);
    });
    doc.end();
    return outputPath;
  } catch (error) {
    throw error;
  }
};

export const registered = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All field is required" });
    const user = await User.findOne({
      email,
    });

    if (user) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const userProfile = new profile({ userId: newUser._id });
    await userProfile.save();
    return res.json({ message: "User created successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All field required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ message: "user does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "invalid credential" });

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });
    return res.json(token);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded!" });
    }

    user.profilePicture = req.file.filename;
    await user.save();

    return res.json({ message: "profile picture updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "user already exist" });
      }
    }

    Object.assign(user, newUserData);

    await user.save();
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userProfile = await profile
      .findOne({ userId: user._id })
      .populate("userId", "name email username profilePicture");

    return res.status(200).json(userProfile);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    const userProfile = await User.findOne({ token: token });

    if (!userProfile) {
      res.status(404).json({ message: "user not found" });
    }

    const Profile_to_update = await profile.findOne({
      userId: userProfile._id,
    });

    Object.assign(Profile_to_update, newProfileData);

    await Profile_to_update.save();
    return res.json({ message: "profile updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await profile
      .find()
      .populate("userId", "name username email profilePicture");

    return res.json({ profiles });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;
    const userProfile = await profile
      .findOne({ userId: user_id })
      .populate("userId", "name username email profilePicture");
    let outputPath = await convertUserDataToPdf(userProfile);
    return res.json({ outputPath });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection User Not Found" });
    }
    const existingUser = await User.connectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingUser) {
      return res.status(500).json({ message: "User Is Already Exist" });
    }

    const connection = new connectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await connection.save();

    return res.status(200).json({ message: "Connection Sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getConnection = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connections = await connectionRequest
      .findOne({ userId: user._id })
      .populate("connectionId", "name username email profilePicture");

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnection = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connections = await connectionRequest
      .find({ connectionId: user._id })
      .populate("connectionId", "name username email profilePicture");

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connection = connectionRequest.findOne({ _id: requestId });
    if (!connection) {
      return res.status(404).json({ message: "Connection Request Not Found" });
    }

    if (action_type === "accept") {
      connection.status.accepted = true;
    } else {
      connection.status.accepted = false;
    }
    await connection.save();
    return res.json({ message: "Connection Request Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findOne({ _id: post_id, userId: user._id });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    const comments =  new Comment({
      userId: user._id,
      postId: post._id,
      comment: commentBody,
    });

    await comments.save();
    return res.json({ comments });
    return res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
