const express = require("express");
const { Board } = require("../models");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("board_create");
});

router.post("/board", async (req, res, next) => {
  const boardName_eng = req.body.boardName_eng;
  const boardName_kor = req.body.boardName_kor;

  try {
    await Board.create({
      boardName_eng,
      boardName_kor,
    });

    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
