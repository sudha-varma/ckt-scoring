import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();
// require and configure dotenv, will load vars in .env in PROCESS.ENV

// define validation for all the env vars
const envTypes = ["development", "production", "test"];
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().allow(envTypes),
})
  .unknown()
  .required();

const { error, value: validData } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error}`);
}
const defaults = require(`../config/defaults.json`); // eslint-disable-line
const config = require(`../config/${validData.NODE_ENV}.json`); // eslint-disable-line
export default { ...defaults, ...config };
