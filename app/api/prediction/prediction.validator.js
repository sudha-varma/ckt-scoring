import Joi from "joi";
import commonValidator from "../../helpers/validators/common.validator";
import constants from "../../helpers/constants";

export default {
  // GET /api/predictions/:matchId
  get: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
  }),

  // GET /api/predictions
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(Joi.any().valid(constants.sortByKeys)),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  }),

  // POST /api/predictions
  create: Joi.object({
    body: Joi.object({
      matchId: commonValidator.validMongoId.required(),
      data: Joi.object().required(),
    }),
  }),

  // PUT /api/predictions/:matchId
  update: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      data: Joi.object(),
    }),
  }),

  // DELETE /api/predictions/:matchId
  remove: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
  }),
};
