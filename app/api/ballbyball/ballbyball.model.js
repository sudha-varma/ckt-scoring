import mongoose from "mongoose";
import constants from "../../helpers/constants";

const infoSchema = new mongoose.Schema(
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
      required: true,
    },
    teamId: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    ],
    inningNo: {
      type: Number,
      required: true,
    },
    overNo: {
      type: Number,
      required: true,
    },
    ball: {
      type: Number,
      required: true,
    },
    info: {
      type: infoSchema,
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
    highlights: {
      type: [
        {
          type: String,
          enum: constants.highlightTypes,
          default: "normal",
        },
      ],
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
 * @typedef BallByBall
 */

modelSchema.index(
  {
    matchId: 1,
    inningNo: 1,
    overNo: 1,
    ball: 1,
    teamId: 1,
  },
  { unique: true },
);
export default mongoose.model("BallByBall", modelSchema);
