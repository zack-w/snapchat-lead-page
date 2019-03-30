'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable("backgroundStyles", {
			id: {
				type: Sequelize.BIGINT,
				primaryKey: true,
				autoIncrement: true
			},
      campaignId: {
        type: Sequelize.BIGINT,
        references: {
          model: "campaigns",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false
      },
			color: {
				type: Sequelize.STRING,
				allowNull: true
      },
			image: {
				type: Sequelize.TEXT,
				allowNull: true
      },
      attachment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
			repeat: {
				type: Sequelize.STRING,
				allowNull: true
      },
      size: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isPreview: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable("backgroundStyles");
	}
};
