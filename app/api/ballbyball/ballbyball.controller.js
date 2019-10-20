import BallByBall from "./ballbyball.model";
import validator from "./ballbyball.validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";
import Match from "../match/match.model";
import Team from "../team/team.model";

/**
 * Get BallByBall
 * @returns {BallByBall}
 */
function get(req, res, next) {
  const schema = validator.get;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting ballbyball details
      const { id } = validParam.params;
      if (err === null) {
        /* eslint-disable-next-line  */
        BallByBall.findOne({ _id: id, status: "active" })
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
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Get ballbyball list.
 * @property {number} req.query.skip - Number of ballbyball to be skipped.
 * @property {number} req.query.limit - Limit number of ballbyball to be returned.
 * @property {array} req.query.highlights - Array of ballbyball highlights.
 * @property {string} req.query.matchId - Array of ballbyball highlights.
 * @property {array} req.query.sortBy - keys to use to record sorting.
 * @returns {BallByBall[]}
 */
function list(req, res, next) {
  // BallByBall.collection.dropIndex("matchId_1_inningNo_1_overNo_1_ball_1");
  // BallByBall.remove({}).exec();
  const schema = validator.list;
  // Validating req query
  schema.validate({ query: req.query }, (err, validQuery) => {
    if (err === null) {
      const {
        limit = 50,
        matchId,
        highlights,
        sortBy,
        latestId,
        lastId,
      } = validQuery.query;
      let { skip = 0 } = validQuery.query;
      const filterCriteria = {
        status: "active",
      };
      if (highlights) {
        filterCriteria.highlights = { $in: highlights };
      }
      if (matchId) {
        filterCriteria.matchId = matchId;
      }
      if (latestId) {
        filterCriteria._id = { $gt: latestId }; // eslint-disable-line
      }
      if (lastId) {
        filterCriteria._id = { $lt: lastId }; // eslint-disable-line
        skip = 0;
      }
      // Getting ballbyball list with filters
      BallByBall.find(filterCriteria)
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
 * Create new ballbyball
 * @property {string} req.body.matchId - match id.
 * @property {string} req.body.teamId - team id.
 * @property {string} req.body.teamKey - team key.
 * @property {number} req.body.inningNo - inning number.
 * @property {number} req.body.overNo - over number.
 * @property {number} req.body.ball - ball number.
 * @property {array} req.body.highlights - array of highlight types.
 * @property {string} req.body.comments - commentary for the ball.
 * @property {string} req.body.info - additional ball info object.
 * @returns {BallByBall}
 */
function create(req, res, next) {
  const schema = validator.create;
  // Validating req body
  schema.validate({ body: req.body }, (err, validData) => {
    if (err === null) {
      const validBody = validData.body;
      const promiseList = [];
      if (validBody.matchId) {
        // Checking if matchId exist
        promiseList.push(
          Match.findOne({
            _id: validBody.matchId,
            status: "active",
          })
            .exec()
            .then(match => {
              if (!match) {
                return {
                  error: {
                    code: 404,
                    data: [
                      {
                        "body,matchId": "Match not found",
                      },
                    ],
                    message: messages.NOT_FOUND,
                  },
                };
              }
              return match;
            }),
        );
      }
      if (validBody.teamId || validBody.teamReference) {
        if (validBody.teamReference) {
          // Checking if teamReference exist
          promiseList.push(
            Team.findOne({
              references: { $elemMatch: validBody.teamReference },
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
                          "body,teamReference": "Team not found",
                        },
                      ],
                      message: messages.NOT_FOUND,
                    },
                  };
                }
                return team;
              }),
          );
        } else {
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
      }
      Promise.all(promiseList).then(promiseListResp => {
        for (let i = 0; i < promiseListResp.length; i += 1) {
          if (promiseListResp[i] && promiseListResp[i].error) {
            const { error } = promiseListResp[i];
            return res.status(error.code).json(error);
          }
        }
        const keyData = {
          matchId: validBody.matchId,
          inningNo: validBody.inningNo,
          overNo: validBody.overNo,
          ball: validBody.ball,
          status: "active",
        };
        if (promiseListResp[1] && promiseListResp[1].id) {
          keyData.teamId = promiseListResp[1].id;
        }
        BallByBall.findOneAndUpdate(keyData, validBody, {
          upsert: true,
          new: true,
        })
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
 * Update existing ballbyball
 * @property {string} req.body.matchId - match id.
 * @property {string} req.body.teamId - team id.
 * @property {number} req.body.inningNo - inning number.
 * @property {number} req.body.overNo - over number.
 * @property {number} req.body.ball - ball number.
 * @property {array} req.body.highlights - array of highlight types.
 * @property {string} req.body.comments - commentary for the ball.
 * @property {string} req.body.info - additional ball info object.
 * @returns {BallByBall}
 */
function update(req, res, next) {
  const schema = validator.update;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting ballbyball object to be updated
      const { id } = validParam.params;
      BallByBall.findOne({ _id: id, status: "active" })
        .exec()
        .then(existingDoc => {
          if (existingDoc !== null) {
            // Validating request body
            /* eslint-disable-next-line  */
            schema.validate({ body: req.body }, (err, validData) => {
              if (err === null) {
                const validBody = validData.body;
                const promiseList = [];
                if (validBody.matchId) {
                  // Checking if matchId exist
                  promiseList.push(
                    Match.findOne({
                      _id: validBody.matchId,
                      status: "active",
                    })
                      .exec()
                      .then(match => {
                        if (!match) {
                          return {
                            error: {
                              code: 404,
                              data: [
                                {
                                  "body,matchId": "Match not found",
                                },
                              ],
                              message: messages.NOT_FOUND,
                            },
                          };
                        }
                        return match;
                      }),
                  );
                }
                if (validBody.teamId) {
                  // Checking if teamId exist
                  promiseList.push(
                    Match.findOne({
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
 * Delete ballbyball.
 * @returns {BallByBall}
 */
function remove(req, res, next) {
  const schema = validator.remove;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Updating status to deleted
      const { id } = validParam.params;
      BallByBall.update(
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
            message: `Unable to delete ballbyball with id: ${id}`,
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

function removeMatch(req, res, next) {
  BallByBall.remove({ matchId: req.body.matchId })
    .exec()
    .then(deletedDoc => {
      if (deletedDoc.n !== 0 && deletedDoc.nModified !== 0) {
        return res.json({
          code: 200,
          message: messages.DELETED,
        });
      }
      if (deletedDoc.n === 0) {
        return res.status(404).json({ code: 404, message: messages.NOT_FOUND });
      }
      // Throwing custom error
      util.ThrowError({
        message: `Unable to delete ballbyball`,
      });
      return true;
    })
    .catch(e => next(e));
}

export default { get, list, create, update, remove, removeMatch };
