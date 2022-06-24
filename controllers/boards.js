const sequelize = require("sequelize");
const { Post, Board, User, Comment } = require("../models");
const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const paginate = require("express-paginate");

// GET /board/boards
exports.getBoards = async function (req, res, next) {
  try {
    const boards = await Board.findAll();
    return res.json({
      boards,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /board/lists?id=#####
exports.getDocs = async function (req, res, next) {
  try {
    const board_id = req.query.id;

    await fsExtra.emptyDir(path.join(__dirname, "..", "pre-uploads"), (err) => {
      if (err) {
        console.error(err);
      }
    });

    const board = await Board.findOne({
      where: { id: board_id },
    });

    const docs = await Post.findAndCountAll({
      where: { BoardId: board.id },
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
      limit: req.query.limit,
      offset: req.skip,
    });

    const promises = docs.rows.map(async (doc) => {
      const author = await User.findOne({ where: { id: doc.UserId } });
      doc.author = author.name;
      return doc;
    });
    await Promise.all(promises);

    const docCount = docs.count;
    const pageCount = Math.ceil(docs.count / req.query.limit);

    res.render("post_list", {
      docs: docs.rows,
      board,
      docCount,
      pageCount,
      pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /board/write?id=######
exports.createDocPage = async function (req, res, next) {
  try {
    const board_id = req.query.id;
    const board = await Board.findOne({
      where: { id: board_id },
    });

    res.render("post_form", { board });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /board/write?id=#####
exports.createDoc = async function (req, res, next) {
  try {
    const board_id = req.query.id;
    const board = await Board.findOne({
      where: { id: board_id },
    });
    const new_doc = await Post.create({
      title: req.body.title,
      content: req.body.content,
      img: req.body.img_url,
      UserId: req.user.id,
      BoardId: board.id,
    });

    res.redirect(`/board/view?id=${board_id}&no=${new_doc.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.preUploadImage = function (req, res, next) {
  res.json({ url: `/pre-img/${req.file.filename}` });
};

// GET /board/view?id=####&no=####
exports.viewDoc = async function (req, res, next) {
  try {
    const board_id = req.query.id;
    const doc_no = req.query.no;

    const doc = await Post.findOne({
      where: { BoardId: board_id, id: doc_no },
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

    const board = await Board.findOne({
      where: { id: board_id },
    });

    const comments = await Comment.findAll({
      where: { PostId: doc.id },
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

    const author = await User.findOne({ where: { id: doc.UserId } });

    const promises = comments.map(async (comment) => {
      const commentAuthor = await User.findOne({
        where: { id: comment.UserId },
      });
      comment.author = commentAuthor.name;
      return comment;
    });
    await Promise.all(promises);

    res.render("post_detail", {
      doc,
      board,
      author: author.name,
      comments,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET /board/modify?id=####&no=####
exports.modifyDocPage = async function (req, res, next) {
  try {
    const board_id = req.query.id;
    const doc_no = req.query.no;

    const doc = await Post.findOne({
      where: { id: doc_no, BoardId: board_id },
    });
    if (req.user?.id !== doc.UserId) {
      return res.write(
        "<script>alert('not valid access');window.location='/';</script>"
      );
    }
    res.render("post_update", { doc });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /board/modify?id=####&no=####
exports.modifyDoc = async function (req, res, next) {
  try {
    const board_id = req.query.id;
    const doc_no = req.query.no;

    const doc = await Post.findOne({ where: { id: doc_no } });
    if (req.user?.id !== doc.UserId) {
      const message = encodeURIComponent("유효하지 않은 접근입니다.");
      return res.redirect(`/?error=${message}`);
    }

    await Post.update(
      {
        title: req.body.title,
        content: req.body.content,
        img: req.body.img_url,
      },
      {
        where: { id: doc_no, UserId: req.user?.id, BoardId: board_id },
      }
    );

    if (doc.img !== req.body.img_url) {
      const imgFileName = doc.img.split("/")[2];
      const filePath = path.join(__dirname, "..", "uploads", imgFileName);
      fs.unlink(filePath, (err) => {
        console.error(err);
      });
    }

    return res.status(201).json({
      redirect: `/board/view?id=${board_id}&no=${doc_no}`,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// GET /board/delete?id=####&no=####
exports.deleteDoc = async function (req, res, next) {
  try {
    const board_id = req.query.id;
    const doc_no = req.query.no;

    const doc = await Post.findOne({
      where: { id: doc_no, BoardId: board_id },
    });
    if (req.user?.id !== doc.UserId) {
      const message = encodeURIComponent("유효하지 않은 접근입니다.");
      return res.redirect(`/?error=${message}`);
    }

    await Post.destroy({ where: { id: doc_no, UserId: req.user?.id } });

    if (doc.img) {
      const imgFileName = doc.img.split("/")[2];
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

// POST /board/forms/comment_submit - req.body includes doc_no, comment
exports.createComment = async function (req, res, next) {
  try {
    const comment = await Comment.create({
      comment: req.body.comment,
      PostId: req.body.doc_no,
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

// POST /board/comment/comment_delete_submit - req.body includes doc_no, comment_id
exports.deleteComment = async function (req, res, next) {
  try {
    const comment = await Comment.findOne({
      where: { id: req.body.comment_id, PostId: req.body.doc_no },
    });

    if (comment.UserId !== req.user?.id) {
      const message = encodeURIComponent("유효하지 않은 접근입니다.");
      return res.redirect(`/?error=${message}`);
    }

    await Comment.destroy({
      where: { id: req.body.comment_id, PostId: req.body.doc_no },
    });

    return res.json({ comment_id: comment.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
