const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");
const boardsController = require("../controllers/boards");

const router = express.Router();

const preUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "pre-uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      cb(null, req.body.img_url.split("/")[2]);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/pre-img",
  isLoggedIn,
  preUpload.single("img"),
  boardsController.preUploadImage
);

// board
router.get("/:boardType", boardsController.getPosts);

router.get("/:boardType/post", isLoggedIn, boardsController.createPostPage);

router.post(
  "/:boardType/post",
  isLoggedIn,
  upload.single("image"),
  boardsController.createPost
);

router.get("/updatePage/:post_id", isLoggedIn, boardsController.updatePostPage);

router.put(
  "/:post_id",
  isLoggedIn,
  upload.single("image"),
  boardsController.updatePost
);

router.delete("/:post_id", isLoggedIn, boardsController.deletePost);

router.get("/:boardType/detail/:post_id", boardsController.getPostDetail);

router.post("/comment/:post_id", isLoggedIn, boardsController.createComment);

router.delete(
  "/comment/:post_id/:comment_id",
  isLoggedIn,
  boardsController.deleteComment
);

module.exports = router;
