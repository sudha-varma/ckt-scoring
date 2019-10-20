import express from "express";
import controller from "./match.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new match (accessed at POST /api/matches)
  .post(controller.create)
  // list all matches (accessed at GET /api/matches)
  .get(controller.list);

router
  .route("/:id")
  // update match (accessed at PUT /api/matches/:id)
  .put(controller.update)
  // remove match (accessed at DELETE /api/matches/:id)
  .delete(controller.remove)
  // get match (accessed at GET /api/matches/:id)
  .get(controller.get);

router
  .route("/:feedSource/:key")
  // get match (accessed at GET /api/matches/:feedSource/:key)
  .get(controller.get);

export default router;
