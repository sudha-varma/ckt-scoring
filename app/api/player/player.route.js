import express from "express";
import controller from "./player.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new players (accessed at POST /api/players)
  .post(controller.create)
  // list all players (accessed at GET /api/players)
  .get(controller.list);

router
  .route("/:id")
  // update players (accessed at PUT /api/players/:id)
  .put(controller.update)
  // remove players (accessed at DELETE /api/players/:id)
  .delete(controller.remove)
  // get players (accessed at GET /api/players/:id)
  .get(controller.get);

router
  .route("/:feedSource/:key")
  // get player (accessed at GET /api/players/:feedSource/:key)
  .get(controller.get);

export default router;
