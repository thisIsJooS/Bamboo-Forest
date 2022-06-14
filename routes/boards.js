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

router.get("/:boardType/post", isLoggedIn, boardsController.getPostPage);

router.post(
  "/:boardType/post",
  isLoggedIn,
  upload2.none(),
  boardsController.createPost
);

router.get("/:boardType/detail/:id", boardsController.getPostDetail);

module.exports = router;
