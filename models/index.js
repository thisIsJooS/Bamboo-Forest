const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const User = require("./user");
const Post = require("./post");
const Board = require("./board");

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Board = Board;

User.init(sequelize);
Post.init(sequelize);
Board.init(sequelize);

User.associate(db);
Post.associate(db);
Board.associate(db);

module.exports = db;
