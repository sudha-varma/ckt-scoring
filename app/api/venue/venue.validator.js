import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/common.validator";

export default {
  // GET /api/venues/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId,
      feedSource: Joi.any().valid(constants.feedSourceTypes),
      key: Joi.string(),
    })
      .xor("id", "feedSource")
      .and("feedSource", "key"),
  }),

  // GET /api/venues
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(Joi.any().valid(constants.sortByKeys)),
      approvalStatus: Joi.array().items(
        Joi.any()
          .valid(constants.approvalStatusTypes)
          .required(),
      ),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  }),

  // POST /api/venues
  create: Joi.object({
    body: Joi.object({
      name: commonValidator.longStr.required(),
      shortName: commonValidator.normalStr.required(),
      displayName: commonValidator.longStr.required(),
      activeFeedSource: Joi.any()
        .valid(constants.feedSourceTypes)
        .required(),
      reference: commonValidator.feedReference.required(),
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      avatar: commonValidator.veryLongStr,
    }),
  }),

  // PUT /api/venues/:id
  update: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      name: commonValidator.longStr,
      shortName: commonValidator.normalStr,
      displayName: commonValidator.longStr,
      activeFeedSource: Joi.any().valid(constants.feedSourceTypes),
      reference: commonValidator.feedReference,
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      avatar: commonValidator.veryLongStr,
    }),
  }),

  // DELETE /api/venues/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),
};
