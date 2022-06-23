const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");
const boardController = require("../controllers/boards");

const router = express.Router();

// Image
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
  boardController.preUploadImage
);

// Board
// POST /board/boards
router.post("/boards", boardController.getBoards);

// Docs
// GET /board/lists?id=#####
router.get("/lists", boardController.getDocs);

// GET /board/write?id=######
router.get("/write", isLoggedIn, boardController.createDocPage);

// POST /board/write?id=#####
router.post(
  "/write",
  isLoggedIn,
  upload.single("image"),
  boardController.createDoc
);

// GET /board/modify?id=####&no=####
router.get("/modify", isLoggedIn, boardController.modifyDocPage);

// POST /board/modify?id=####&no=####
router.post(
  "/modify",
  isLoggedIn,
  upload.single("image"),
  boardController.modifyDoc
);

// GET /board/delete?id=####&no=####
router.get("/delete", isLoggedIn, boardController.deleteDoc);

// GET /board/view?id=####&no=####
router.get("/view", boardController.viewDoc);

// Comment
// POST /board/forms/comment_submit
router.post("/forms/comment_submit", isLoggedIn, boardController.createComment);

// POST /board/comment/comment_update_submit
router.post(
  "comment/comment_update_submit",
  isLoggedIn,
  boardController.modifyComment
);

// GET /board/comment/comment_delete_submit
router.get(
  "/comment/comment_delete_submit",
  isLoggedIn,
  boardController.deleteComment
);

module.exports = router;
