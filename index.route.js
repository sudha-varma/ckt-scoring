import express from "express";
import seriesRoutes from "./app/api/series/series.route";
import teamRoutes from "./app/api/team/team.route";
import playerRoutes from "./app/api/player/player.route";
import matchRoutes from "./app/api/match/match.route";
import venueRoutes from "./app/api/venue/venue.route";
import squadRoutes from "./app/api/squad/squad.route";
import scorecardRoutes from "./app/api/scorecard/scorecard.route";
import ballbyballRoutes from "./app/api/ballbyball/ballbyball.route";
import predictionRoutes from "./app/api/prediction/prediction.route";
import ballbyballController from "./app/api/ballbyball/ballbyball.controller";

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get("/health-check", (req, res) => res.send("OK"));

// mount sample routes at /sample
router.use("/series", seriesRoutes);
router.use("/teams", teamRoutes);
router.use("/players", playerRoutes);
router.use("/matches", matchRoutes);
router.use("/venues", venueRoutes);
router.use("/squads", squadRoutes);
router.use("/scorecards", scorecardRoutes);
router.use("/ballbyballs", ballbyballRoutes);
router.use("/predictions", predictionRoutes);
router.use("/remove-match-ballbyball", ballbyballController.removeMatch);

export default router;
