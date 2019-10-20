import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/common.validator";

export default {
  // GET /api/teams/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId,
      feedSource: Joi.any().valid(constants.feedSourceTypes),
      key: Joi.string(),
    })
      .xor("id", "feedSource")
      .and("feedSource", "key"),
  }),

  // GET /api/teams
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

  // POST /api/teams
  create: Joi.object({
    body: Joi.object({
      name: commonValidator.normalStr.required(),
      shortName: commonValidator.shortStr.required(),
      displayName: commonValidator.normalStr.required(),
      activeFeedSource: Joi.any()
        .valid(constants.feedSourceTypes)
        .required(),
      reference: commonValidator.feedReference.required(),
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      avatar: commonValidator.veryLongStr,
    }),
  }),

  // PUT /api/teams/:id
  update: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      name: commonValidator.normalStr,
      shortName: commonValidator.shortStr,
      displayName: commonValidator.normalStr,
      activeFeedSource: Joi.any().valid(constants.feedSourceTypes),
      reference: commonValidator.feedReference,
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      avatar: commonValidator.veryLongStr,
    }),
  }),

  // DELETE /api/teams/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),
};
