const { Op } = require("sequelize");

const { AuthToken } = require("../models");

module.exports = async () => {
  try {
    const threeMinutesAgo = new Date();
    threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3);

    const targets = await AuthToken.findAll({
      where: {
        createdAt: { [Op.lte]: threeMinutesAgo },
      },
    });

    targets.forEach(async (target) => {
      await AuthToken.destroy({ where: { id: target.id } });
    });
  } catch (error) {
    console.error(error);
  }
};
