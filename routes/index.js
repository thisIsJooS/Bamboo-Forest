const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Image Upload
try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

try {
  fs.readdirSync("pre-uploads");
} catch (error) {
  console.error("pre-uploads 폴더가 없어 pre-uploads 폴더를 생성합니다.");
  fs.mkdirSync("pre-uploads");
}

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get("/", (req, res, next) => {
  res.render("home");
});

module.exports = router;
