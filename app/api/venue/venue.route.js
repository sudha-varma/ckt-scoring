import express from "express";
import controller from "./venue.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new venue (accessed at POST /api/venues)
  .post(controller.create)
  // list all venue (accessed at GET /api/venues)
  .get(controller.list);

router
  .route("/:id")
  // update venue (accessed at PUT /api/venues/:id)
  .put(controller.update)
  // remove venue (accessed at DELETE /api/venues/:id)
  .delete(controller.remove)
  // get venue (accessed at GET /api/venues/:id)
  .get(controller.get);

router
  .route("/:feedSource/:key")
  // get venue (accessed at GET /api/venues/:feedSource/:key)
  .get(controller.get);

export default router;
