import mongoose from "mongoose";
import constants from "../../helpers/constants";
import { venueSchema } from "../venue/venue.model";
import { teamSchema } from "../team/team.model";

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
    displayName: {
      type: String,
      required: true,
    },
    format: {
      type: [
        {
          type: String,
          enum: constants.seriesFormatTypes,
          default: "international",
        },
      ],
      required: true,
    },
    filters: {
      type: filterSchema,
    },
    liveStatus: {
      type: String,
      enum: constants.seriesLiveStatusTypes,
      default: "upcoming",
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
    references: {
      type: [referenceSchema],
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: constants.approvalStatusTypes,
      default: "approved",
    },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
    squads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Squad" }],
    venues: {
      type: [venueSchema],
    },
    teams: {
      type: [teamSchema],
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
 * @typedef Series
 */

export default mongoose.model("Series", modelSchema);
