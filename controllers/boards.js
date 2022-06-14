const { Post, User } = require("../models");

exports.getPosts = async function (req, res, next) {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.render("anon_index", { posts });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getPostPage = function (req, res, next) {
  res.render("anon_post_form");
};

exports.postPost = async function (req, res, next) {
  try {
    await Post.create({
      title: req.body.title,
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.uploadImage = function (req, res, next) {
  res.json({ url: `/img/${req.file.filename}` });
};

exports.getPostDetail = async function (req, res, next) {
  const postId = req.params.id;
  try {
    const post_detail = await Post.findOne({
      where: { id: postId },
    });
    res.render("anon_detail", { post_detail });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
