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

const seriesTeamSchema = new mongoose.Schema(
  {
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    activeFeedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      default: "cricketapi",
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

const teamPlayerSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    activeFeedSource: {
      type: String,
      enum: constants.feedSourceTypes,
      default: "cricketapi",
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
 * @typedef Team
 */
export default mongoose.model("Team", modelSchema);
export const teamSchema = modelSchema;
export const SeriesTeam = mongoose.model("SeriesTeam", seriesTeamSchema);
export const TeamPlayer = mongoose.model("TeamPlayer", teamPlayerSchema);
