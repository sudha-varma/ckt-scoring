import express from "express";
import controller from "./team.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new team (accessed at POST /api/teams)
  .post(controller.create)
  // list all teams (accessed at GET /api/teams)
  .get(controller.list);

router
  .route("/:id")
  // update team (accessed at PUT /api/teams/:id)
  .put(controller.update)
  // remove team (accessed at DELETE /api/teams/:id)
  .delete(controller.remove)
  // get team (accessed at GET /api/teams/:id)
  .get(controller.get);

router
  .route("/:feedSource/:key")
  // get team (accessed at GET /api/teams/:feedSource/:key)
  .get(controller.get);

export default router;
