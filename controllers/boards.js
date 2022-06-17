const sequelize = require("sequelize");
const { Post, Board, User, Comment } = require("../models");

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

exports.createPostPage = function (req, res, next) {
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
      img: req.body.img_url,
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

    const currentBoard = await Board.findOne({ where: { id: post.BoardId } });

    await Post.destroy({ where: { id: post_id, UserId: req.user?.id } });

    res.redirect(`/boards/${currentBoard.boardName_eng}`);
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
