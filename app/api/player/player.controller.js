import Player from "./player.model";
import validator from "./player.validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";

/**
 * Get Player
 * @returns {Player}
 */
function get(req, res, next) {
  const schema = validator.get;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    const filterCriteria = { status: "active" };
    if (validParam.params.id) {
      /* eslint-disable-next-line  */
      filterCriteria._id = validParam.params.id;
    } else {
      filterCriteria.references = {
        $elemMatch: {
          feedSource: validParam.params.feedSource,
          key: validParam.params.key,
        },
      };
    }
    if (err === null) {
      // Getting player details
      Player.findOne(filterCriteria)
        .exec()
        .then(doc => {
          if (doc !== null) {
            return res.json({
              code: 200,
              data: doc,
              message: messages.SUCCESSFULL,
            });
          }
          return res
            .status(404)
            .json({ code: 404, message: messages.NOT_FOUND });
        })
        .catch(e => next(e));
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Get player list.
 * @property {number} req.query.skip - Number of player to be skipped.
 * @property {number} req.query.limit - Limit number of player to be returned.
 * @property {array} req.query.sortBy - keys to use to record sorting.
 * @returns {Player[]}
 */
function list(req, res, next) {
  const schema = validator.list;
  // Validating req query
  schema.validate({ query: req.query }, (err, validQuery) => {
    if (err === null) {
      const { limit = 50, skip = 0, approvalStatus, sortBy } = validQuery.query;
      const filterCriteria = {
        status: "active",
      };
      if (approvalStatus) {
        filterCriteria.approvalStatus = { $in: approvalStatus };
      }
      // Getting player list with filters
      Player.find(filterCriteria)
        .sort(util.parseSortBy(sortBy))
        .skip(+skip)
        .limit(+limit)
        .exec()
        .then(docs =>
          res.json({
            code: 200,
            data: docs,
            message: messages.SUCCESSFULL,
          }),
        )
        .catch(e => next(e));
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Create new player
 * @property {string} req.body.name - The name of player.
 * @property {string} req.body.shortName - The short name of player.
 * @property {string} req.body.displayName - The display name of player.
 * @property {string} req.body.activeFeedSource - The current active feed source of player.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of player.
 * @property {string} req.body.approvalStatus - The approval status of player.
 * @property {string} req.body.avatar - The avatar of player.
 * @property {string} req.body.nationality - The nationality of player.
 * @property {string} req.body.profile - The summery of player.
 * @property {string} req.body.personalDetails - The personal details of player.
 * @property {string} req.body.carrerInfo - The carrer information of player.
 * @property {string} req.body.batFieldStats - The batting and fielding stats of player.
 * @property {string} req.body.bowlFieldStats - The bowl stats of player.
 * @returns {Player}
 */
function create(req, res, next) {
  const schema = validator.create;
  // Validating req body
  schema.validate({ body: req.body }, (err, validData) => {
    if (err === null) {
      const validBody = validData.body;
      const promiseList = [];
      if (validBody.reference) {
        // Checking if document exist with same reference
        promiseList.push(
          Player.findOne({
            references: { $elemMatch: validBody.reference },
            status: "active",
          })
            .exec()
            .then(existingRefDoc => {
              if (existingRefDoc !== null) {
                return {
                  error: {
                    code: 409,
                    data: [
                      {
                        "body,references":
                          "Reference with same source and key already exist",
                      },
                    ],
                    message: messages.ALREADY_EXIST,
                    conflictKey: existingRefDoc.id,
                  },
                };
              }
              return true;
            }),
        );
      }
      Promise.all(promiseList).then(promiseListResp => {
        for (let i = 0; i < promiseListResp.length; i += 1) {
          if (promiseListResp[i] && promiseListResp[i].error) {
            const { error } = promiseListResp[i];
            return res.status(error.code).json(error);
          }
        }
        validBody.references = [validBody.reference];
        const newDoc = new Player(validBody);
        newDoc
          .save()
          .then(savedDoc =>
            res.status(201).json({
              code: 201,
              data: savedDoc,
              message: messages.CREATED,
            }),
          )
          .catch(e => next(e));
        return true;
      });
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Create new player
 * @property {string} req.body.name - The name of player.
 * @property {string} req.body.shortName - The short name of player.
 * @property {string} req.body.displayName - The display name of player.
 * @property {string} req.body.activeFeedSource - The current active feed source of player.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of player.
 * @property {string} req.body.approvalStatus - The approval status of player.
 * @property {string} req.body.avatar - The avatar of player.
 * @property {string} req.body.nationality - The nationality of player.
 * @property {string} req.body.profile - The summery of player.
 * @property {string} req.body.personalDetails - The personal details of player.
 * @property {string} req.body.carrerInfo - The carrer information of player.
 * @property {string} req.body.batFieldStats - The batting and fielding stats of player.
 * @property {string} req.body.bowlFieldStats - The bowl stats of player.
 * @returns {Player}
 */
function update(req, res, next) {
  const schema = validator.update;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting player object to be updated
      Player.findOne({ _id: validParam.params.id, status: "active" })
        .exec()
        .then(existingDoc => {
          if (existingDoc !== null) {
            // Validating request body
            /* eslint-disable-next-line  */
            schema.validate({ body: req.body }, (err, validData) => {
              if (err === null) {
                const validBody = validData.body;
                const promiseList = [];
                // Checking if "reference" update is requested
                if (validBody.reference) {
                  // Checking if document already exist with same reference
                  promiseList.push(
                    Player.findOne({
                      _id: { $ne: existingDoc.id },
                      references: { $elemMatch: validBody.reference },
                      status: "active",
                    })
                      .exec()
                      .then(existingRefDoc => {
                        if (existingRefDoc !== null) {
                          return {
                            error: {
                              code: 409,
                              data: [
                                {
                                  "body,references":
                                    "Reference with same source and key already exist",
                                },
                              ],
                              message: messages.ALREADY_EXIST,
                              conflictKey: existingRefDoc.id,
                            },
                          };
                        }
                        // Checking if new feedSource already there in references list
                        let exist = false;
                        for (
                          let i = 0;
                          i < existingDoc.references.length;
                          i += 1
                        ) {
                          const reference = existingDoc.references[i];
                          if (
                            reference.feedSource ===
                            validBody.reference.feedSource
                          ) {
                            reference.key = validBody.reference.key;
                            exist = true;
                            break;
                          }
                        }
                        // Adding new reference to existing references
                        if (!exist) {
                          existingDoc.references.push(validBody.reference);
                        }
                        return true;
                      }),
                  );
                }
                // Waiting for promises to finish
                Promise.all(promiseList).then(promiseListResp => {
                  for (let i = 0; i < promiseListResp.length; i += 1) {
                    if (promiseListResp[i] && promiseListResp[i].error) {
                      const { error } = promiseListResp[i];
                      return res.status(error.code).json(error);
                    }
                  }
                  if (err === null) {
                    // Updating new data to document
                    existingDoc.set(validBody);
                    existingDoc
                      .save()
                      .then(savedDoc =>
                        res.json({
                          code: 200,
                          data: savedDoc,
                          message: messages.UPDATED,
                        }),
                      )
                      .catch(e => next(e));
                  } else {
                    return res.status(400).json(util.FormatJOIError(err));
                  }
                  return true;
                });
              } else {
                return res.status(400).json(util.FormatJOIError(err));
              }
            });
          } else {
            return res
              .status(404)
              .json({ code: 404, message: messages.NOT_FOUND });
          }
          return true;
        })
        .catch(e => next(e));
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Delete player.
 * @returns {Player}
 */
function remove(req, res, next) {
  const schema = validator.remove;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Updating status to deleted
      const { id } = validParam.params;
      Player.update(
        { _id: id, status: "active" },
        { $set: { status: "deleted" } },
      )
        .exec()
        .then(deletedDoc => {
          if (deletedDoc.n !== 0 && deletedDoc.nModified !== 0) {
            return res.json({
              code: 200,
              message: messages.DELETED,
            });
          }
          if (deletedDoc.n === 0) {
            return res
              .status(404)
              .json({ code: 404, message: messages.NOT_FOUND });
          }
          // Throwing custom error
          util.ThrowError({
            message: `Unable to delete player id: ${id}`,
          });
          return true;
        })
        .catch(e => next(e));
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

export default { get, list, create, update, remove };
