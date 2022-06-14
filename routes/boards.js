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

// Anonymous Board
router.get("/", boardsController.getPosts);

router.get("/anonymous", boardsController.getPosts);

router.get("/anonymous/post", isLoggedIn, boardsController.getPostPage);

router.post(
  "/anonymous/post",
  isLoggedIn,
  upload2.none(),
  boardsController.postPost
);

router.get("/anonymous/detail/:id", boardsController.getPostDetail);

module.exports = router;
