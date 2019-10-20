import Joi from "joi";
import commonValidator from "../../helpers/validators/common.validator";
import constants from "../../helpers/constants";

export default {
  // GET /api/scorecards/:matchId
  get: Joi.object({
    query: Joi.object({
      cardType: Joi.any().valid(constants.cardType),
    }),
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
  }),

  // GET /api/scorecards
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(
        Joi.any().valid(constants.sortByKeys.concat("featured", "-featured")),
      ),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
      cardType: Joi.any().valid(constants.cardType),
      filters: Joi.array().items(
        Joi.any()
          .valid(constants.scoreCardFilterTypes)
          .required(),
      ),
    }),
  }),

  // POST /api/scorecards
  create: Joi.object({
    body: Joi.object({
      matchId: commonValidator.validMongoId.required(),
      card: Joi.object().required(),
      filters: Joi.array().items(
        Joi.any().valid(constants.scoreCardFilterTypes),
      ),
    }),
  }),

  // PUT /api/scorecards/:matchId
  update: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      card: Joi.object(),
      filters: Joi.array().items(
        Joi.any().valid(constants.scoreCardFilterTypes),
      ),
    }),
  }),

  // DELETE /api/scorecards/:matchId
  remove: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
  }),
};
