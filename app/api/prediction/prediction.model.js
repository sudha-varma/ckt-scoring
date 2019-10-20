import mongoose from "mongoose";
import constants from "../../helpers/constants";

const dataSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  { _id: false, strict: false },
);

const modelSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
    },
    data: {
      type: dataSchema,
      required: true,
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
 * @typedef Prediction
 */
modelSchema.index({ matchId: 1 }, { unique: true });
export default mongoose.model("Prediction", modelSchema);
