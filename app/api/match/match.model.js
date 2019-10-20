import mongoose from "mongoose";
import constants from "../../helpers/constants";

const referenceSchema = new mongoose.Schema(
  {
    feedSource: {
      type: String,
      enum: constants.sourceTypes,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const filterSchema = new mongoose.Schema({}, { _id: false, strict: false });

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
    secondaryName: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: Date.now,
    },
    activeFeedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      default: "cricketapi",
    },
    activePredictionSource: {
      type: String,
      enum: constants.predictionSourceTypes,
      default: "cricviz",
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
    liveStatus: {
      type: String,
      enum: constants.matchLiveStatusTypes,
      default: "upcoming",
    },
    format: {
      type: String,
      enum: constants.matchFormatTypes,
      default: "odi",
      required: true,
    },
    filters: {
      type: filterSchema,
    },
    teamAId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    teamBId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    winnerTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    teamASuad: [{ type: mongoose.Schema.Types.ObjectId, ref: "Squad" }],
    teamBSuad: [{ type: mongoose.Schema.Types.ObjectId, ref: "Squad" }],
    teamAPlayingXi: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    teamBPlayingXi: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },
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
 * @typedef Match
 */
export default mongoose.model("Match", modelSchema);
