import Promise from "bluebird"; // eslint-disable-line no-global-assign
import mongoose from "mongoose";
// config should be imported before importing any other file
import config from "./config";
import app from "./config/express";
import logger from "./utils/logger";

// make bluebird default Promise

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

const db = config.database;
// connect to mongo db
const mongoUri = `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${
  db.dbname
}?authSource=admin`;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  keepAlive: 1,
});
mongoose.set("useCreateIndex", true);
mongoose.set("findAndModify", false);

mongoose.connection.on("error", err => {
  logger.error(err.message);
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (db.mongooseDebug) {
  mongoose.set("debug", db.mongooseDebug);
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    logger.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

export default app;
