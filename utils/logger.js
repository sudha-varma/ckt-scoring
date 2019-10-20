import { createLogger, format, transports } from "winston";
import fs from "fs";
const { combine, timestamp, printf } = format;
const logDir = "log";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const myFormat = printf(
  info =>
    `{timestamp: ${info.timestamp}, level: ${info.level}, message: ${
      info.message
    }}`,
);

const customLevels = {
  levels: {
    error: 0,
    warning: 1,
    debug: 2,
    info: 3,
  },
  colors: {
    error: "red",
    warning: "green",
    debug: "yellow",
    info: "blue",
  },
};
const logger = createLogger({
  levels: customLevels.levels,
  transports: [
    new transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
      // handleExceptions: true,
      format: combine(timestamp(), myFormat),
      maxsize: 1000000,
    }),
    new transports.File({
      filename: `${logDir}/info.log`,
      level: "info",
      // handleExceptions: true,
      format: combine(timestamp(), myFormat),
      maxsize: 1000000,
    }),
    new transports.File({
      filename: `${logDir}/combined.log`,
      // handleExceptions: true,
      format: combine(timestamp(), myFormat),
      maxsize: 1000000,
    }),
  ],
  // exceptionHandlers: [
  //   new transports.File({
  //     filename: `${logDir}/exceptions.log`,
  //     timestamp: true,
  //     maxsize: 1000000
  //   })
  // ],
  // exitOnError: true
});
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      colorize: true,
      level: "info",
      format: combine(timestamp(), myFormat),
    }),
  );
}
export default logger;
