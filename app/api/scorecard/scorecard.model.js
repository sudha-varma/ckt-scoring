import mongoose from "mongoose";
import constants from "../../helpers/constants";

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { _id: false, strict: false },
);

const filterSchema = new mongoose.Schema({}, { _id: false, strict: false });

const modelSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
    },
    card: {
      type: cardSchema,
      required: true,
    },
    filters: {
      type: filterSchema,
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
 * @typedef ScoreCard
 */
modelSchema.index({ matchId: 1 }, { unique: true });
export default mongoose.model("ScoreCard", modelSchema);
