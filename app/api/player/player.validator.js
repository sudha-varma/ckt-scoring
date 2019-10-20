import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/common.validator";

const personalDetailsSchema = Joi.object({
  dob: Joi.string(),
  birthPlace: Joi.string(),
  height: Joi.string(),
  approvalStatus: Joi.any().valid(constants.playerRoleTypes),
  battingStyle: Joi.any().valid(constants.battingStyleTypes),
  bowlingStyle: Joi.any().valid(constants.bowlingStyleTypes),
});

const batFieldStatSchema = Joi.object({
  matchesPlayed: Joi.number().integer(),
  inningsPlayed: Joi.number().integer(),
  notOuts: Joi.number().integer(),
  runs: Joi.number().integer(),
  highestScore: Joi.number().integer(),
  avg: Joi.number(),
  ballsFaced: Joi.number().integer(),
  strikeRate: Joi.number(),
  centuries: Joi.number().integer(),
  doubleCenturies: Joi.number().integer(),
  fifties: Joi.number().integer(),
  fours: Joi.number().integer(),
  sixes: Joi.number().integer(),
  catchesTaken: Joi.number().integer(),
  stumpingsMade: Joi.number().integer(),
});

const playerBatFieldStatsSchema = Joi.object({
  test: batFieldStatSchema.required(),
  odi: batFieldStatSchema.required(),
  t20i: batFieldStatSchema.required(),
});

const bowlStatSchema = Joi.object({
  matchesPlayed: Joi.number().integer(),
  inningsPlayed: Joi.number().integer(),
  balls: Joi.number().integer(),
  runs: Joi.number().integer(),
  wickets: Joi.number().integer(),
  bestBallInInnings: commonValidator.shortStr,
  bestBallInMatches: commonValidator.shortStr,
  economy: Joi.number(),
  avg: Joi.number(),
  strikeRate: Joi.number(),
  fiveWickets: Joi.number().integer(),
  tenWickets: Joi.number().integer(),
});

const playerBowlStatsSchema = Joi.object({
  test: bowlStatSchema.required(),
  odi: bowlStatSchema.required(),
  t20i: bowlStatSchema.required(),
});

export default {
  // GET /api/player/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId,
      feedSource: Joi.any().valid(constants.feedSourceTypes),
      key: Joi.string(),
    })
      .xor("id", "feedSource")
      .and("feedSource", "key"),
  }),

  // GET /api/player
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

  // POST /api/player
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
      nationality: commonValidator.longStr,
      profile: Joi.string(),
      personalDetails: personalDetailsSchema,
      batFieldStats: playerBatFieldStatsSchema,
      bowlStats: playerBowlStatsSchema,
    }),
  }),

  // PUT /api/player/:id
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
      nationality: commonValidator.longStr,
      profile: Joi.string(),
      personalDetails: personalDetailsSchema,
      batFieldStats: playerBatFieldStatsSchema,
      bowlStats: playerBowlStatsSchema,
    }),
  }),

  // DELETE /api/player/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),
};
