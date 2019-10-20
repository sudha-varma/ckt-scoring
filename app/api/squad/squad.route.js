import express from "express";
import controller from "./squad.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new squad (accessed at POST /api/squads)
  .post(controller.create)
  // list all squads (accessed at GET /api/squads)
  .get(controller.list);

router
  .route("/:id")
  // update squad (accessed at PUT /api/squads/:id)
  .put(controller.update)
  // remove squad (accessed at DELETE /api/squads/:id)
  .delete(controller.remove)
  // get squad (accessed at GET /api/squads/:id)
  .get(controller.get);

router
  .route("/:feedSource/:key")
  // get squad (accessed at GET /api/squads/:feedSource/:key)
  .get(controller.get);

export default router;
