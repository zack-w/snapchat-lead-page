require("dotenv").config();
const url = require("url");

var parse = require('pg-connection-string').parse;

var databaseConfig = {};

if (process.env.DATABASE_URL !== undefined) {
	var config = parse(process.env.DATABASE_URL);

	databaseConfig = {
		host: config.host,
		port: parseInt(config.port),
		username: config.user,
		password: config.password,
		database: config.database,
		logging: true,
		dialect: "postgres",
		dialectOptions: {
			ssl: { require: true }
		}
	};
} else {
	throw Error("no posgres database information provided");
}


module.exports = {};
["development", "test", "production"].forEach((env) => {
	module.exports[env] = databaseConfig;
});
