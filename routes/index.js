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

router.all(function (req, res, next) {
  // set default or minimum is 10 (as it was prior to v0.2.0)
  if (!req.quert.limit || req.query.limit <= 10) {
    req.query.limit = 10;
  }
  next();
});

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get("/", (req, res, next) => {
  res.render("home", { error_message: req.query?.error });
});

module.exports = router;
