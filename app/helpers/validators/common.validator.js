import Joi from "joi";
import constants from "../constants";
import regex from "./regex";

export default {
  // POST /api/series
  shortStr: Joi.string()
    .min(constants.minShortStr)
    .max(constants.maxShortStr),
  normalStr: Joi.string()
    .min(constants.minStr)
    .max(constants.maxStr),
  longStr: Joi.string()
    .min(constants.minLongStr)
    .max(constants.maxLongStr),
  veryLongStr: Joi.string()
    .min(constants.minVeryLongStr)
    .max(constants.maxVeryLongStr),
  statusType: Joi.any().valid(constants.statusTypes),
  validMongoId: Joi.string()
    .regex(regex.mongoIdRegex)
    .options({
      language: {
        string: {
          regex: {
            base: "!!Invalid Id",
          },
        },
      },
    }),
  feedReference: Joi.object({
    feedSource: Joi.any()
      .valid(constants.feedSourceTypes)
      .required(),
    key: Joi.string().required(),
  }),
};
