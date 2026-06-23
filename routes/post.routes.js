import { Router } from "express";
import { activeCheck, createPost, getAllPost,deletePost, get_comments_by_post, delete_comment_by_user, increment_likes } from "../controllers/post.controllers.js";
import multer from "multer";
const router = Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route("/").get(activeCheck);

router.route("post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPost);
router.route("delete_post").post(deletePost);
router.route("/comment").post(get_comments_by_post);
router.route("delete_comment").delete(delete_comment_by_user)
router.route("increment_like").post(increment_likes);


export default router;