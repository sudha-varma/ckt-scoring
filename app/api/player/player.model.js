import mongoose from "mongoose";
import constants from "../../helpers/constants";

const referenceSchema = new mongoose.Schema(
  {
    feedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const personalDetailsSchema = new mongoose.Schema(
  {
    dob: {
      type: String,
    },
    birthPlace: {
      type: String,
    },
    height: {
      type: String,
    },
    role: {
      type: String,
      enum: constants.playerRoleTypes,
      default: "batsman",
    },
    battingStyle: {
      type: String,
      enum: constants.battingStyleTypes,
      default: "right handed bat",
    },
    bowlingStyle: {
      type: String,
      enum: constants.bowlingStyleTypes,
      default: "right-arm fast",
    },
  },
  { _id: false },
);

const playerCarrerSchema = new mongoose.Schema(
  {
    testDebut: {
      type: String,
    },
    lastTest: {
      type: String,
    },
    odiDebut: {
      type: String,
    },
    lastOdi: {
      type: String,
    },
    t20Debut: {
      type: String,
    },
    lastT20: {
      type: String,
    },
  },
  { _id: false },
);

const batFieldStatSchema = new mongoose.Schema(
  {
    matchesPlayed: {
      type: Number,
    },
    inningsPlayed: {
      type: Number,
    },
    notOuts: {
      type: Number,
    },
    runs: {
      type: Number,
    },
    highestScore: {
      type: Number,
    },
    avg: {
      type: Number,
    },
    ballsFaced: {
      type: Number,
    },
    strikeRate: {
      type: Number,
    },
    centuries: {
      type: Number,
    },
    doubleCenturies: {
      type: Number,
    },
    fifties: {
      type: Number,
    },
    fours: {
      type: Number,
    },
    sixes: {
      type: Number,
    },
    catchesTaken: {
      type: Number,
    },
    stumpingsMade: {
      type: Number,
    },
  },
  { _id: false },
);
const playerBatFieldStatsSchema = new mongoose.Schema(
  {
    test: {
      type: batFieldStatSchema,
      required: true,
    },
    odi: {
      type: batFieldStatSchema,
      required: true,
    },
    t20i: {
      type: batFieldStatSchema,
      required: true,
    },
  },
  { _id: false },
);
const bowlStatSchema = new mongoose.Schema(
  {
    matchesPlayed: {
      type: Number,
    },
    inningsPlayed: {
      type: Number,
    },
    balls: {
      type: Number,
    },
    runs: {
      type: Number,
    },
    wickets: {
      type: Number,
    },
    bestBallInInnings: {
      type: String,
    },
    bestBallInMatches: {
      type: String,
    },
    economy: {
      type: Number,
    },
    avg: {
      type: Number,
    },
    strikeRate: {
      type: Number,
    },
    fiveWickets: {
      type: Number,
    },
    tenWickets: {
      type: Number,
    },
  },
  { _id: false },
);
const playerBowlStatsSchema = new mongoose.Schema(
  {
    test: {
      type: bowlStatSchema,
      required: true,
    },
    odi: {
      type: bowlStatSchema,
      required: true,
    },
    t20i: {
      type: bowlStatSchema,
      required: true,
    },
  },
  { _id: false },
);

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    activeFeedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      default: "cricketapi",
    },
    references: {
      type: [referenceSchema],
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: constants.approvalStatusTypes,
      default: "approved",
    },
    avatar: {
      type: String,
    },
    nationality: {
      type: String,
    },
    profile: {
      type: String,
    },
    personalDetails: {
      type: personalDetailsSchema,
    },
    carrerInfo: {
      type: playerCarrerSchema,
    },
    batFieldStats: {
      type: playerBatFieldStatsSchema,
    },
    bowlStats: {
      type: playerBowlStatsSchema,
    },
    status: {
      type: String,
      enum: constants.statusTypes,
      default: "active",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
modelSchema.method({});

/**
 * Statics
 */
modelSchema.statics = {};

/**
 * @typedef Player
 */
export default mongoose.model("Player", modelSchema);
