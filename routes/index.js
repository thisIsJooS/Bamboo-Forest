const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index", { title: "하이" });
});

module.exports = router;
