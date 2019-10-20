import express from "express";
import controller from "./series.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new series (accessed at POST /api/series)
  .post(controller.create)
  // list all series (accessed at GET /api/series)
  .get(controller.list);

router
  .route("/:id")
  // update series (accessed at PUT /api/series/:id)
  .put(controller.update)
  // remove series (accessed at DELETE /api/series/:id)
  .delete(controller.remove)
  // get series (accessed at GET /api/series/:id)
  .get(controller.get);

router
  .route("/:feedSource/:key")
  // get series (accessed at GET /api/series/:feedSource/:key)
  .get(controller.get);

export default router;
