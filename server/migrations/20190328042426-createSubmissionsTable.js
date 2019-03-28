'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("campaigns", {
			id: {
				type: Sequelize.BIGINT,
				primaryKey: true,
				autoIncrement: true
      },
      ownerUserId: {
        type: Sequelize.BIGINT,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("now")
			}
    })
    .then(() => {
      return queryInterface.createTable("campaignFields", {
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
        key: {
          type: Sequelize.STRING,
          allowNull: false
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
      })
    })
    .then(() => {
      return queryInterface.createTable("submissions", {
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
        zapierSent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("now")
        }
      })
    })
		.then(() => {
			return queryInterface.createTable("submissionValues", {
				id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        submissionId: {
          type: Sequelize.BIGINT,
          references: {
            model: "submissions",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
          allowNull: false
        },
        key: {
          type: Sequelize.STRING,
          allowNull: false
        },
        value: {
          type: Sequelize.STRING,
          allowNull: false
        }
			});
		});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("submissionValues").then(() => {
      queryInterface.dropTable("submissions");
    }).then(() => {
      queryInterface.dropTable("campaignFields");
    }).then(() => {
      queryInterface.dropTable("campaigns");
    });
  }
};
