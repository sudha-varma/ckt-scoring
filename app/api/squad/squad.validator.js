import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/common.validator";

export default {
  // GET /api/squads/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId,
      feedSource: Joi.any().valid(constants.feedSourceTypes),
      key: Joi.string(),
    })
      .xor("id", "feedSource")
      .and("feedSource", "key"),
  }),

  // GET /api/squads
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(Joi.any().valid(constants.sortByKeys)),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
      approvalStatus: Joi.array().items(
        Joi.any()
          .valid(constants.approvalStatusTypes)
          .required(),
      ),
    }),
  }),

  // POST /api/squads
  create: Joi.object({
    body: Joi.object({
      teamId: commonValidator.validMongoId.required(),
      seriesId: commonValidator.validMongoId.required(),
      playerIds: Joi.array()
        .items(commonValidator.validMongoId)
        .required(),
      activeFeedSource: Joi.any()
        .valid(constants.feedSourceTypes)
        .required(),
      reference: commonValidator.feedReference.required(),
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
    }),
  }),

  // PUT /api/squads/:id
  update: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      playerIds: Joi.array().items(commonValidator.validMongoId),
      activeFeedSource: Joi.any().valid(constants.feedSourceTypes),
      reference: commonValidator.feedReference,
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
    }),
  }),

  // DELETE /api/squads/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),
};
