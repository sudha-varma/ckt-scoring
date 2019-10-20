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
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    playerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
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
 * @typedef Squad
 */
export default mongoose.model("Squad", modelSchema);
