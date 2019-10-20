import Squad from "./squad.model";
import validator from "./squad.validator";
import util from "../../../utils/util";
import Series from "../series/series.model";
import Team from "../team/team.model";
import Player from "../player/player.model";
import messages from "../../../localization/en";

/**
 * Get Squad
 * @returns {Squad}
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
      // Getting squad details
      Squad.findOne(filterCriteria)
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
 * Get squads list.
 * @property {string} req.query.approvalStatus - Array of approval status.
 * @property {number} req.query.skip - Number of squads to be skipped.
 * @property {number} req.query.limit - Limit number of squads to be returned.
 * @property {array} req.query.sortBy - keys to use to record sorting.
 * @returns {Squad[]}
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
      // Getting squad list with filters
      Squad.find(filterCriteria)
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
 * Create squad
 * @property {string} req.body.seriesId - series for the squad.
 * @property {string} req.body.teamId - Team for the squad.
 * @property {array} req.body.playerIds - Player id list for the squad.
 * @property {string} req.body.activeFeedSource - The current active feed source of squad.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of squad.
 * @property {string} req.body.approvalStatus - The approval status of squad.
 * @returns {Squad}
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
          Squad.findOne({
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
      if (validBody.seriesId) {
        // Checking if seriesId exist
        promiseList.push(
          Series.findOne({
            _id: validBody.seriesId,
            status: "active",
          })
            .exec()
            .then(series => {
              if (!series) {
                return {
                  error: {
                    code: 404,
                    data: [
                      {
                        "body,seriesId": "Series not found",
                      },
                    ],
                    message: messages.NOT_FOUND,
                  },
                };
              }
              return series;
            }),
        );
      }
      if (validBody.teamId) {
        // Checking if teamId exist
        promiseList.push(
          Team.findOne({
            _id: validBody.teamId,
            status: "active",
          })
            .exec()
            .then(team => {
              if (!team) {
                return {
                  error: {
                    code: 404,
                    data: [
                      {
                        "body,teamId": "Team not found",
                      },
                    ],
                    message: messages.NOT_FOUND,
                  },
                };
              }
              return team;
            }),
        );
      }
      if (validBody.playerIds) {
        // Checking if playerIds valid
        promiseList.push(
          Player.find({
            _id: { $in: [validBody.playerIds] },
            status: "active",
          })
            .exec()
            .then(teams => {
              if (teams.length !== 2) {
                return {
                  error: {
                    code: 400,
                    data: [
                      {
                        "body,playerIds": "Invalid playerIds",
                      },
                    ],
                    message: messages.INVALID_DATA,
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
        const newDoc = new Squad(validBody);
        newDoc
          .save()
          .then(savedDoc => {
            const series = promiseListResp[1];
            // Updating series table with squad object
            series.squads.push(savedDoc.id);
            res.status(201).json({
              code: 201,
              data: savedDoc,
              message: messages.CREATED,
            });
          })
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
 * Update existing squad
 * @property {string} req.body.seriesId - series for the squad.
 * @property {string} req.body.teamId - Team for the squad.
 * @property {array} req.body.playerIds - Player id list for the squad.
 * @property {string} req.body.activeFeedSource - The current active feed source of squad.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of squad.
 * @property {string} req.body.approvalStatus - The approval status of squad.
 * @returns {Squad}
 */
function update(req, res, next) {
  const schema = validator.update;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting squad object to be updated
      Squad.findOne({ _id: validParam.params.id, status: "active" })
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
                    Squad.findOne({
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
                if (validBody.seriesId) {
                  // Checking if seriesId exist
                  promiseList.push(
                    Series.findOne({
                      _id: validBody.seriesId,
                      status: "active",
                    })
                      .exec()
                      .then(series => {
                        if (!series) {
                          return {
                            error: {
                              code: 404,
                              data: [
                                {
                                  "body,seriesId": "Series not found",
                                },
                              ],
                              message: messages.NOT_FOUND,
                            },
                          };
                        }
                        return series;
                      }),
                  );
                }
                if (validBody.teamId) {
                  // Checking if teamId exist
                  promiseList.push(
                    Team.findOne({
                      _id: validBody.teamId,
                      status: "active",
                    })
                      .exec()
                      .then(team => {
                        if (!team) {
                          return {
                            error: {
                              code: 404,
                              data: [
                                {
                                  "body,teamId": "Team not found",
                                },
                              ],
                              message: messages.NOT_FOUND,
                            },
                          };
                        }
                        return team;
                      }),
                  );
                }
                if (validBody.playerIds) {
                  // Checking if playerIds valid
                  promiseList.push(
                    Player.find({
                      _id: { $in: [validBody.playerIds] },
                      status: "active",
                    })
                      .exec()
                      .then(teams => {
                        if (teams.length !== 2) {
                          return {
                            error: {
                              code: 400,
                              data: [
                                {
                                  "body,playerIds": "Invalid playerIds",
                                },
                              ],
                              message: messages.INVALID_DATA,
                            },
                          };
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
                      .then(savedDoc => {
                        const series = promiseListResp[1];
                        // Updating series table with squad object
                        series.squad.push(savedDoc.id);
                        res.json({
                          code: 200,
                          data: savedDoc,
                          message: messages.UPDATED,
                        });
                      })
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
 * Delete squad.
 * @returns {Squad}
 */
function remove(req, res, next) {
  const schema = validator.remove;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      const { id } = validParam.params;
      // Updating status to deleted
      Squad.update(
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
            message: `Unable to delete squad id: ${id}`,
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
