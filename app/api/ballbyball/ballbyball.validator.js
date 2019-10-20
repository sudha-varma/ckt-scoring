import Joi from "joi";
import commonValidator from "../../helpers/validators/common.validator";
import constants from "../../helpers/constants";

export default {
  // GET /api/ballbyballs/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),

  // GET /api/ballbyballs
  list: Joi.object({
    query: Joi.object({
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
      matchId: commonValidator.validMongoId,
      latestId: commonValidator.validMongoId,
      lastId: commonValidator.validMongoId,
      sortBy: Joi.array().items(
        Joi.any().valid(
          constants.sortByKeys.concat(
            "inningNo",
            "-inningNo",
            "overNo",
            "-overNo",
          ),
        ),
      ),
      highlights: Joi.array().items(
        Joi.any()
          .valid(constants.highlightTypes)
          .required(),
      ),
    }),
  }),

  // POST /api/ballbyballs
  create: Joi.object({
    body: Joi.object({
      matchId: commonValidator.validMongoId.required(),
      teamId: commonValidator.validMongoId,
      teamReference: commonValidator.feedReference,
      inningNo: Joi.number()
        .integer()
        .required(),
      overNo: Joi.number()
        .integer()
        .required(),
      ball: Joi.number()
        .integer()
        .required(),
      info: Joi.object().required(),
      comments: Joi.string().required(),
      highlights: Joi.array()
        .items(
          Joi.any()
            .valid(constants.highlightTypes)
            .required(),
        )
        .required(),
    }).xor("teamId", "teamReference"),
  }),

  // PUT /api/ballbyballs/:id
  update: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      matchId: commonValidator.validMongoId,
      teamId: commonValidator.validMongoId,
      inningNo: Joi.number().integer(),
      overNo: Joi.number().integer(),
      ball: Joi.number().integer(),
      comments: Joi.string(),
      info: Joi.object(),
      highlights: Joi.array().items(Joi.any().valid(constants.highlightTypes)),
    }),
  }),

  // DELETE /api/ballbyballs/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),
};
