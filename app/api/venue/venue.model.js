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

/**
 * @typedef Venue
 */

export const venueSchema = modelSchema;
export default mongoose.model("Venue", modelSchema);
