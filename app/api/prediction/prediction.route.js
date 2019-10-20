import express from "express";
import controller from "./prediction.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new prediction (accessed at POST /api/predictions)
  .post(controller.create)
  // list all predictions (accessed at GET /api/predictions)
  .get(controller.list);

router
  .route("/:matchId")
  // update prediction (accessed at PUT /api/predictions/:matchId)
  .put(controller.update)
  // remove prediction (accessed at DELETE /api/predictions/:matchId)
  .delete(controller.remove)
  // get prediction (accessed at GET /api/predictions/:matchId)
  .get(controller.get);

export default router;
