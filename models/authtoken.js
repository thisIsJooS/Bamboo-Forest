const Sequelize = require("sequelize");

module.exports = class AuthToken extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        token: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        userId: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "AuthToken",
        tableName: "authtokens",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {}
};
