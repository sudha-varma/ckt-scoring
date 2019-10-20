import express from "express";
import controller from "./ballbyball.controller";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  // create new ballbyball (accessed at POST /api/ballbyballs)
  .post(controller.create)
  // list all ballbyballs (accessed at GET /api/ballbyballs)
  .get(controller.list);

router
  .route("/:id")
  // update ballbyball (accessed at PUT /api/ballbyballs/:id)
  .put(controller.update)
  // remove ballbyball (accessed at DELETE /api/ballbyballs/:id)
  .delete(controller.remove)
  // get ballbyball (accessed at GET /api/ballbyballs/:id)
  .get(controller.get);

export default router;
