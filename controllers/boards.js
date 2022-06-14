const sequelize = require("sequelize");
const { Post, Board, User } = require("../models");

exports.getPosts = async function (req, res, next) {
  const boardType = req.params.boardType;
  try {
    const currentBoard = await Board.findOne({
      where: { boardName_eng: boardType },
    });

    const posts = await Post.findAll({
      where: { BoardId: currentBoard.id },
      order: [["createdAt", "DESC"]],
      raw: true,
      attributes: {
        include: [
          "id",
          "title",
          "content",
          "img",
          [
            sequelize.fn(
              "DATE_FORMAT",
              sequelize.col("createdAt"),
              "%Y-%m-%d %H:%i:%s"
            ),
            "createdAt",
          ],
          [
            sequelize.fn(
              "DATE_FORMAT",
              sequelize.col("updatedAt"),
              "%Y-%m-%d %H:%i:%s"
            ),
            "updatedAt",
          ],
        ],
      },
    });

    const promises = posts.map(async (post) => {
      const author = await User.findOne({ where: { id: post.UserId } });
      post.author = author.name;
      return post;
    });
    await Promise.all(promises);

    res.render("post_list", {
      posts,
      boardName_kor: currentBoard.boardName_kor,
      boardType,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getPostPage = function (req, res, next) {
  const boardType = req.params.boardType;
  res.render("post_form", { boardType });
};

exports.createPost = async function (req, res, next) {
  const boardType = req.params.boardType;
  try {
    const currentBoard = await Board.findOne({
      where: { boardName_eng: boardType },
    });
    await Post.create({
      title: req.body.title,
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
      BoardId: currentBoard.id,
    });

    res.redirect(`/boards/${boardType}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.uploadImage = function (req, res, next) {
  res.json({ url: `/img/${req.file.filename}` });
};

exports.getPostDetail = async function (req, res, next) {
  const boardType = req.params.boardType;
  const postId = req.params.id;
  try {
    const post_detail = await Post.findOne({
      where: { id: postId },
    });
    res.render("post_detail", { post_detail });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
