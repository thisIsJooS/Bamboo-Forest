const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");
const boardsController = require("../controllers/boards");

const router = express.Router();

// Image Upload
try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const upload2 = multer();

router.post(
  "/img",
  isLoggedIn,
  upload.single("img"),
  boardsController.uploadImage
);

// board
router.get("/:boardType", boardsController.getPosts);

router.get("/:boardType/post", isLoggedIn, boardsController.createPostPage);

router.post(
  "/:boardType/post",
  isLoggedIn,
  upload2.none(),
  boardsController.createPost
);

router.get("/:boardType/detail/:post_id", boardsController.getPostDetail);

router.get("/update/:post_id", isLoggedIn, boardsController.updatePostPage);

router.post("/update/:post_id", isLoggedIn, boardsController.updatePost);

router.get("/delete/:post_id", isLoggedIn, boardsController.deletePost);

router.post("/comment/:post_id", isLoggedIn, boardsController.createComment);

module.exports = router;
