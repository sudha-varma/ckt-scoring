import express from "express";
import controller from "./scorecard.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new scorecard (accessed at POST /api/scorecards)
  .post(controller.create)
  // list all scorecards (accessed at GET /api/scorecards)
  .get(controller.list);

router
  .route("/:matchId")
  // update scorecard (accessed at PUT /api/scorecards/:matchId)
  .put(controller.update)
  // remove scorecard (accessed at DELETE /api/scorecards/:matchId)
  .delete(controller.remove)
  // get scorecard (accessed at GET /api/scorecards/:matchId)
  .get(controller.get);

export default router;
