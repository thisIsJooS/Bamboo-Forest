const sequelize = require("sequelize");
const { Post, Board, User, Comment } = require("../models");
const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");

exports.getPosts = async function (req, res, next) {
  const boardType = req.params.boardType;
  try {
    await fsExtra.emptyDir(path.join(__dirname, "..", "pre-uploads"), (err) => {
      if (err) {
        console.error(err);
      }
    });

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

exports.createPostPage = async function (req, res, next) {
  const boardType = req.params.boardType;

  try {
    const board = await Board.findOne({
      where: { boardName_eng: boardType },
    });
    const boardName_kor = board.boardName_kor;
    res.render("post_form", { boardType, boardName_kor });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.createPost = async function (req, res, next) {
  const boardType = req.params.boardType;
  try {
    const currentBoard = await Board.findOne({
      where: { boardName_eng: boardType },
    });
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      img: req.body.img_url,
      UserId: req.user.id,
      BoardId: currentBoard.id,
    });

    res.redirect(`/boards/${boardType}/detail/${post.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.preUploadImage = function (req, res, next) {
  res.json({ url: `/pre-img/${req.file.filename}` });
};

exports.getPostDetail = async function (req, res, next) {
  const boardType = req.params.boardType;
  const post_id = req.params.post_id;
  try {
    const post_detail = await Post.findOne({
      where: { id: post_id },
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

    const comments = await Comment.findAll({
      where: { PostId: post_id },
      attributes: {
        include: [
          "id",
          "comment",
          [
            sequelize.fn(
              "DATE_FORMAT",
              sequelize.col("createdAt"),
              "%Y-%m-%d %H:%i:%s"
            ),
            "createdAt",
          ],
        ],
      },
    });

    const author = await User.findOne({ where: { id: post_detail.UserId } });

    const promises = comments.map(async (comment) => {
      const commentAuthor = await User.findOne({
        where: { id: comment.UserId },
      });
      comment.author = commentAuthor.name;
      return comment;
    });
    await Promise.all(promises);

    res.render("post_detail", {
      post_detail,
      boardType,
      author: author.name,
      comments,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updatePostPage = async function (req, res, next) {
  const post_id = req.params.post_id;
  try {
    const post = await Post.findOne({ where: { id: post_id } });
    if (req.user?.id !== post.UserId) {
      return res.write(
        "<script>alert('not valid access');window.location='/';</script>"
      );
    }
    res.render("post_update", { post });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.updatePost = async function (req, res, next) {
  const post_id = req.params.post_id;
  try {
    const post = await Post.findOne({ where: { id: post_id } });
    if (req.user?.id !== post.UserId) {
      return res.write(
        "<script>alert('not valid access');window.location='/';</script>"
      );
    }

    const currentBoard = await Board.findOne({ where: { id: post.BoardId } });

    await Post.update(
      {
        title: req.body.title,
        content: req.body.content,
        img: req.body.img_url,
      },
      {
        where: { id: post_id, UserId: req.user?.id },
      }
    );

    if (post.img !== req.body.img_url) {
      const imgFileName = post.img.split("/")[2];
      const filePath = path.join(__dirname, "..", "uploads", imgFileName);
      fs.unlink(filePath, (err) => {
        console.error(err);
      });
    }

    return res.status(201).json({
      redirect: `/boards/${currentBoard.boardName_eng}/detail/${post_id}`,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deletePost = async function (req, res, next) {
  const post_id = req.params.post_id;
  try {
    const post = await Post.findOne({ where: { id: post_id } });
    if (req.user?.id !== post.UserId) {
      return res.write(
        "<script>alert('not valid access');window.location='/';</script>"
      );
    }

    await Post.destroy({ where: { id: post_id, UserId: req.user?.id } });

    if (post.img) {
      const imgFileName = post.img.split("/")[2];
      const filePath = path.join(__dirname, "..", "uploads", imgFileName);
      fs.unlink(filePath, (err) => {
        console.error(err);
      });
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.createComment = async function (req, res, next) {
  const post_id = req.params.post_id;
  try {
    const comment = await Comment.create({
      comment: req.body.comment,
      PostId: post_id,
      UserId: req.user.id,
    });

    const author = await User.findOne({
      where: { id: req.user.id },
      attributes: {
        include: ["name"],
      },
    });

    return res.json({
      comment,
      comment_author: author.name,
      comment_createdAt: format_date(comment.createdAt),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

function format_date(date) {
  return require("moment")(date).format("YYYY-MM-DD HH:mm:ss");
}

exports.deleteComment = async function (req, res, next) {
  const post_id = req.params.post_id;
  const comment_id = req.params.comment_id;
  try {
    const comment = await Comment.findOne({ where: { id: comment_id } });
    if (comment.UserId !== req.user?.id) {
      return res.write(
        "<script>alert('not valid access');window.location='/';</script>"
      );
    }

    await Comment.destroy({ where: { id: comment_id, PostId: post_id } });
    return res.json({ comment_id });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
