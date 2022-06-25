const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("video", { error_message: req.query?.error });
});

module.exports = router;
