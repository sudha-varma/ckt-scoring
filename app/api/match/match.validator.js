import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/common.validator";

const matchFeedReference = Joi.object({
  feedSource: Joi.any()
    .valid(constants.sourceTypes)
    .required(),
  key: Joi.string().required(),
});

export default {
  // GET /api/matches/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId,
      feedSource: Joi.any().valid(constants.feedSourceTypes),
      key: Joi.string(),
    })
      .xor("id", "feedSource")
      .and("feedSource", "key"),
  }),

  // GET /api/matches
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(
        Joi.any().valid(constants.sortByKeys.concat("featured", "-featured")),
      ),
      filters: Joi.array().items(
        Joi.any()
          .valid(constants.matchFilterTypes)
          .required(),
      ),
      approvalStatus: Joi.array().items(
        Joi.any()
          .valid(constants.approvalStatusTypes)
          .required(),
      ),
      format: Joi.array().items(
        Joi.any()
          .valid(constants.matchFormatTypes)
          .required(),
      ),
      liveStatus: Joi.array().items(
        Joi.any()
          .valid(constants.matchLiveStatusTypes)
          .required(),
      ),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  }),

  // POST /api/matches
  create: Joi.object({
    body: Joi.object({
      name: commonValidator.longStr.required(),
      shortName: commonValidator.normalStr.required(),
      secondaryName: commonValidator.longStr.required(),
      number: Joi.number()
        .integer()
        .required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().min(Joi.ref("startDate")),
      activeFeedSource: Joi.any()
        .valid(constants.feedSourceTypes)
        .required(),
      reference: matchFeedReference.required(),
      activePredictionSource: Joi.any().valid(constants.predictionSourceTypes),
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      liveStatus: Joi.any().valid(constants.matchLiveStatusTypes),
      format: Joi.any()
        .valid(constants.matchFormatTypes)
        .required(),
      filters: Joi.array().items(Joi.any().valid(constants.matchFilterTypes)),
      teamAId: commonValidator.validMongoId.required(),
      teamBId: commonValidator.validMongoId
        // .invalid(Joi.ref("teamAId"))
        .required(),
      winnerTeamId: commonValidator.validMongoId.valid([
        Joi.ref("teamAId"),
        Joi.ref("teamBId"),
      ]),
      seriesId: commonValidator.validMongoId.required(),
      teamASuad: Joi.array().items(commonValidator.validMongoId),
      teamBSuad: Joi.array().items(commonValidator.validMongoId),
      teamAPlayingXi: Joi.array().items(commonValidator.validMongoId),
      teamBPlayingXi: Joi.array().items(commonValidator.validMongoId),
      venueId: commonValidator.validMongoId,
    }),
  }),

  // PUT /api/matches/:id
  update: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      name: commonValidator.longStr,
      shortName: commonValidator.normalStr,
      secondaryName: commonValidator.longStr,
      number: Joi.number().integer(),
      startDate: Joi.date(),
      endDate: Joi.date().min(Joi.ref("startDate")),
      activeFeedSource: Joi.any().valid(constants.feedSourceTypes),
      reference: matchFeedReference,
      activePredictionSource: Joi.any().valid(constants.predictionSourceTypes),
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
      liveStatus: Joi.any().valid(constants.matchLiveStatusTypes),
      format: Joi.any().valid(constants.matchFormatTypes),
      filters: Joi.array().items(Joi.any().valid(constants.matchFilterTypes)),
      teamAId: commonValidator.validMongoId,
      teamBId: commonValidator.validMongoId,
      // .invalid(Joi.ref("teamAId")),
      winnerTeamId: commonValidator.validMongoId.valid([
        Joi.ref("teamAId"),
        Joi.ref("teamBId"),
      ]),
      teamASuad: Joi.array().items(commonValidator.validMongoId),
      teamBSuad: Joi.array().items(commonValidator.validMongoId),
      teamAPlayingXi: Joi.array().items(commonValidator.validMongoId),
      teamBPlayingXi: Joi.array().items(commonValidator.validMongoId),
      venueId: commonValidator.validMongoId,
    }),
  }),

  // DELETE /api/matches/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),
};
