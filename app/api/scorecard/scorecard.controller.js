import ScoreCard from "./scorecard.model";
import validator from "./scorecard.validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";
import Match from "../match/match.model";
import { redisClient } from "../../../utils/redis";

/**
 * Get ScoreCard
 * @property {string} req.query.cardType - card type for scorecard.
 * @returns {ScoreCard}
 */
function get(req, res, next) {
  const schema = validator.get;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting scorecard details
      const { matchId } = validParam.params;
      // Checking scoreCard type
      // Validating req query
      /* eslint-disable-next-line  */
      schema.validate({ query: req.query }, (err, validQuery) => {
        if (err === null) {
          const { cardType = "Micro" } = validQuery.query;
          const filterCriteria = {
            matchId,
            status: "active",
          };
          redisClient.mget(
            [`${matchId}${cardType}Scorecard`, `${matchId}Prediction`],
            /* eslint-disable-next-line  */
            (err, replies) => {
              if (err === null && replies && replies[0] && replies[1]) {
                const scorecard = JSON.parse(replies[0]);
                const prediction = JSON.parse(replies[1]);
                if (prediction) {
                  delete prediction.history;
                  scorecard.prediction = prediction;
                }
                if (scorecard) {
                  return res.json({
                    code: 200,
                    // data: { card: scorecard },
                    data: scorecard,
                    message: messages.SUCCESSFULL,
                  });
                }
              }
              ScoreCard.findOne(filterCriteria)
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
            },
          );
        } else {
          return res.status(400).json(util.FormatJOIError(err));
        }
      });
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Get scorecard list.
 * @property {number} req.query.skip - Number of scorecard to be skipped.
 * @property {number} req.query.limit - Limit number of scorecard to be returned.
 * @property {array} req.query.filters - Array of scorecard filters.
 * @property {string} req.query.cardType - card type for scorecard.
 * @property {array} req.query.sortBy - keys to use to record sorting.
 * @returns {ScoreCard[]}
 */
function list(req, res, next) {
  const schema = validator.list;
  // Validating req query
  schema.validate({ query: req.query }, (err, validQuery) => {
    if (err === null) {
      const {
        limit = 50,
        skip = 0,
        filters,
        cardType = "Micro",
        sortBy,
      } = validQuery.query;
      const filterCriteria = {
        status: "active",
      };
      /* eslint-disable-next-line  */
      redisClient.get(`featuredMatches`, (err, reply) => {
        if (reply) {
          console.log(reply)
          const matcheKeys = JSON.parse(reply);
          const scoreCardKeys = matcheKeys.map(
            matchKey => `${matchKey}${cardType}Scorecard`,
          );
          const predictionKeys = matcheKeys.map(
            matchKey => `${matchKey}Prediction`,
          );
          // Getting prediction data
          /* eslint-disable-next-line  */
          redisClient.mget(scoreCardKeys, (err, replies) => {
            if (err === null && replies) {
              /* eslint-disable-next-line  */
              const scorecards = replies.map(reply => {
                if (reply !== null) {
                  return JSON.parse(reply);
                }
              });
              /* eslint-disable-next-line  */
              redisClient.mget(predictionKeys, (err, replies) => {
                if (err === null && replies) {
                  /* eslint-disable-next-line  */
                  const predictions = replies.map(reply => {
                    if (reply !== null) {
                      return JSON.parse(reply);
                    }
                  });
                  const mergedScorecards = [];
                  scorecards.forEach((scorecard, index) => {
                    const scorecardCopy = scorecard;
                    if (scorecardCopy) {
                      if (predictions[index]) {
                        delete predictions[index].history;
                        scorecardCopy.prediction = predictions[index];
                      }
                      // mergedScorecards.push({ card: scorecardCopy });
                      mergedScorecards.push(scorecardCopy);
                    }
                  });
                  if (mergedScorecards.length) {
                    res.json({
                      code: 200,
                      data: mergedScorecards,
                      message: messages.SUCCESSFULL,
                    });
                  } else {
                    res.json({
                      code: 200,
                      data: mergedScorecards,
                      message: messages.NOT_FOUND,
                    });
                  }
                }
              });
            } else {
              filterCriteria.matchId = { $in: matcheKeys };
              // Getting scorecard list with filters
              ScoreCard.find(filterCriteria)
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
              // res.json({
              //   code: 200,
              //   data: [],
              //   message: messages.SUCCESSFULL,
              // });
            }
          });
        } else {
          if (filters) {
            filters.forEach(filter => {
              filterCriteria[`filters.${filter}`] = true;
            });
          }
          // Getting scorecard list with filters
          ScoreCard.find(filterCriteria)
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
        }
      });
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Create new scorecard
 * @property {string} req.body.matchId - match id.
 * @property {string} req.body.card - match scorecard object.
 * @returns {ScoreCard}
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
      Promise.all(promiseList).then(promiseListResp => {
        for (let i = 0; i < promiseListResp.length; i += 1) {
          if (promiseListResp[i] && promiseListResp[i].error) {
            const { error } = promiseListResp[i];
            return res.status(error.code).json(error);
          }
        }
        // Converting filter array to object
        if (validBody.filters) {
          const tempFilters = {};
          validBody.filters.forEach(filter => {
            tempFilters[filter] = true;
          });
          validBody.filters = tempFilters;
        }
        ScoreCard.findOneAndUpdate(
          {
            matchId: validBody.matchId,
            status: "active",
          },
          validBody,
          {
            upsert: true,
            new: true,
          },
        )
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
 * Update existing scorecard
 * @property {string} req.body.card - match scorecard object.
 * @returns {ScoreCard}
 */
function update(req, res, next) {
  const schema = validator.update;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting scorecard object to be updated
      const { matchId } = validParam.params;
      ScoreCard.findOne({ matchId, status: "active" })
        .exec()
        .then(existingDoc => {
          if (existingDoc !== null) {
            // Validating request body
            /* eslint-disable-next-line  */
            schema.validate({ body: req.body }, (err, validData) => {
              if (err === null) {
                const validBody = validData.body;
                // Converting filter array to object
                if (validBody.filters) {
                  const tempFilters = {};
                  validBody.filters.forEach(filter => {
                    tempFilters[filter] = true;
                  });
                  validBody.filters = tempFilters;
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
 * Delete scorecard.
 * @returns {ScoreCard}
 */
function remove(req, res, next) {
  const schema = validator.remove;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Updating status to deleted
      const { matchId } = validParam.params;
      ScoreCard.update(
        { matchId, status: "active" },
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
            message: `Unable to delete scorecard with matchId: ${matchId}`,
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
