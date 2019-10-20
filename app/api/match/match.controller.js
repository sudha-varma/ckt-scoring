import Match from "./match.model";
import ScoreCard from "../scorecard/scorecard.model";
import Series from "../series/series.model";
import Team from "../team/team.model";
import Venue from "../venue/venue.model";
import validator from "./match.validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";
import { pushQueue, redisClient } from "../../../utils/redis";
import logger from "../../../utils/logger";

/**
 * Get Match
 * @returns {Match}
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
      // Getting match details
      Match.findOne(filterCriteria)
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
 * Get matches list.
 * @property {array} req.query.filters - Array of series filters.
 * @property {array} req.query.approvalStatus - Array of approval status.
 * @property {array} req.query.format - Array of series formats.
 * @property {array} req.query.liveStatus - Array of series live status.
 * @property {number} req.query.skip - Number of matches to be skipped.
 * @property {number} req.query.limit - Limit number of matches to be returned.
 * @property {array} req.query.sortBy - keys to use to record sorting.
 * @returns {Match[]}
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
        approvalStatus,
        format,
        liveStatus,
        sortBy,
      } = validQuery.query;
      const filterCriteria = {
        status: "active",
      };
      if (filters) {
        filters.forEach(filter => {
          filterCriteria[`filters.${filter}`] = true;
        });
      }
      if (approvalStatus) {
        filterCriteria.approvalStatus = { $in: approvalStatus };
      }
      if (format) {
        filterCriteria.format = { $in: format };
      }
      if (liveStatus) {
        filterCriteria.liveStatus = { $in: liveStatus };
      }
      console.log(filterCriteria)
      // Getting matches list with filters
      Match.find(filterCriteria)
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
 * Create match
 * @property {string} req.body.name - The name of match.
 * @property {string} req.body.shortName - The short name of match.
 * @property {string} req.body.secondaryName - The secondary name of match.
 * @property {number} req.body.number - Number for the match.
 * @property {date} req.body.startDate - The start date of match.
 * @property {date} req.body.endDate - The end date of match.
 * @property {string} req.body.activeFeedSource - The current active feed source of match.
 * @property {string} req.body.activePredictionSource - The current active prediction source of match.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of match.
 * @property {string} req.body.approvalStatus - The approval status of match.
 * @property {string} req.body.liveStatus - The live status of match.
 * @property {string} req.body.format - The format of match.
 * @property {string} req.body.filters - The filters type for the match.
 * @property {string} req.body.seriesId - series for the match.
 * @property {string} req.body.teamAId - Team A for the match.
 * @property {string} req.body.teamBId - Team B for the match.
 * @property {string} req.body.winnerTeamId - Team who won the match.
 * @property {string} req.body.teamASuad - List of teamA players for the match.
 * @property {string} req.body.teamBSuad - List of teamB players for the match.
 * @property {string} req.body.teamAPlayingXi - List of teamA playing x1 for the match.
 * @property {string} req.body.teamBPlayingXi - List of teamB playing x1 for the match.
 * @property {string} req.body.venueId - The venue for the match.
 * @returns {Match}
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
          Match.findOne({
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
      if (validBody.teamAId || validBody.teamBId) {
        // Checking if teamAId and teamBId exist
        promiseList.push(
          Team.find({
            _id: { $in: [validBody.teamAId, validBody.teamBId] },
            status: "active",
          })
            .exec()
            .then(teams => {
              if (
                !(
                  teams.length === 2 ||
                  (validBody.teamAId === validBody.teamBId &&
                    teams.length === 1)
                )
              ) {
                return {
                  error: {
                    code: 404,
                    data: [
                      {
                        "body,teamAId": "Either team A or team B not found",
                        "body,teamBId": "Either team A or team B not found",
                      },
                    ],
                    message: messages.NOT_FOUND,
                  },
                };
              }
              return true;
            }),
        );
      }
      if (validBody.venueId) {
        // Checking if venueId exist
        if (validBody.venueId) {
          promiseList.push(
            Venue.findOne({
              _id: validBody.venueId,
              status: "active",
            })
              .exec()
              .then(venue => {
                if (!venue) {
                  return {
                    error: {
                      code: 404,
                      data: [
                        {
                          "body,venueId": "Venue not found",
                        },
                      ],
                      message: messages.NOT_FOUND,
                    },
                  };
                }
                return venue;
              }),
          );
        }
      }
      // TODO: validate teamASquad,teamBSquad,teamAPlayingXi,teamBPlayingXi,winnerTeamId
      Promise.all(promiseList).then(promiseListResp => {
        for (let i = 0; i < promiseListResp.length; i += 1) {
          if (promiseListResp[i] && promiseListResp[i].error) {
            const { error } = promiseListResp[i];
            return res.status(error.code).json(error);
          }
        }
        validBody.references = [validBody.reference];
        // Converting filter array to object
        if (validBody.filters) {
          const tempFilters = {};
          validBody.filters.forEach(filter => {
            tempFilters[filter] = true;
          });
          validBody.filters = tempFilters;
        }
        const newDoc = new Match(validBody);
        newDoc
          .save()
          .then(savedDoc => {
            const series = promiseListResp[1];
            // Updating series table with team ref, venue object
            series.matches.push(savedDoc.id);
            if (validBody.venueId) {
              // Checking if object already exist in venueList
              const venue = promiseListResp[3];
              const existingVenue = series.venues.find(venueObj => {
                if (venueObj) {
                  return venueObj.id === venue.id;
                }
                return false;
              });
              if (!existingVenue) {
                series.venues.push(venue);
              }
            }
            series
              .save()
              .then(() => {
                logger.info("Match info added to series list");
                return true;
              })
              .catch(e => {
                logger.error(e.message);
                return false;
              });
            return res.status(201).json({
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
 * Update existing match
 * @property {string} req.body.name - The name of match.
 * @property {string} req.body.shortName - The short name of match.
 * @property {string} req.body.secondaryName - The secondary name of match.
 * @property {number} req.body.number - Number for the match.
 * @property {date} req.body.startDate - The start date of match.
 * @property {date} req.body.endDate - The end date of match.
 * @property {string} req.body.activeFeedSource - The current active feed source of match.
 * @property {string} req.body.activePredictionSource - The current active prediction source of match.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of match.
 * @property {string} req.body.approvalStatus - The approval status of match.
 * @property {string} req.body.liveStatus - The live status of match.
 * @property {string} req.body.format - The format of match.
 * @property {string} req.body.filters - The filters type for the match.
 * @property {string} req.body.liveStatus - The live status for the match.
 * @property {string} req.body.seriesId - series for the match.
 * @property {string} req.body.teamAId - Team A for the match.
 * @property {string} req.body.teamBId - Team B for the match.
 * @property {string} req.body.winnerTeamId - Team who won the match.
 * @property {string} req.body.teamASuad - List of teamA players for the match.
 * @property {string} req.body.teamBSuad - List of teamB players for the match.
 * @property {string} req.body.teamAPlayingXi - List of teamA playing x1 for the match.
 * @property {string} req.body.teamBPlayingXi - List of teamB playing x1 for the match.
 * @property {string} req.body.venueId - The venue for the match.
 * @returns {Match}
 */
function update(req, res, next) {
  const schema = validator.update;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      const matchId = validParam.params.id;
      // Getting match object to be updated
      Match.findOne({ _id: matchId, status: "active" })
        .populate("seriesId")
        .populate("venueId")
        .exec()
        .then(existingDoc => {
          if (existingDoc !== null) {
            // Validating request body
            /* eslint-disable-next-line  */
            schema.validate({ body: req.body }, (err, validData) => {
              if (err === null) {
                const validBody = validData.body;
                const promiseList = [];
                if (validBody.reference) {
                  // Checking if document already exist with same reference
                  promiseList.push(
                    Match.findOne({
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
                if (validBody.teamAId || validBody.teamBId) {
                  // Checking if teamAId and teamBId exist
                  promiseList.push(
                    Team.find({
                      _id: { $in: [validBody.teamAId, validBody.teamBId] },
                      status: "active",
                    })
                      .exec()
                      .then(teams => {
                        if (
                          !(
                            teams.length === 2 ||
                            (validBody.teamAId === validBody.teamBId &&
                              teams.length === 1)
                          )
                        ) {
                          return {
                            error: {
                              code: 404,
                              data: [
                                {
                                  "body,teamAId":
                                    "Either team A or team B not found",
                                  "body,teamBId":
                                    "Either team A or team B not found",
                                },
                              ],
                              message: messages.NOT_FOUND,
                            },
                          };
                        }
                        return true;
                      }),
                  );
                }
                if (validBody.venueId) {
                  // Checking if venueId exist
                  promiseList.push(
                    Venue.findOne({
                      _id: validBody.venueId,
                      status: "active",
                    })
                      .exec()
                      .then(venue => {
                        if (!venue) {
                          return {
                            error: {
                              code: 404,
                              data: [
                                {
                                  "body,venueId": "Venue not found",
                                },
                              ],
                              message: messages.NOT_FOUND,
                            },
                          };
                        }
                        return venue;
                      }),
                  );
                }
                // TODO: validate teamASquad,teamBSquad,teamAPlayingXi,teamBPlayingXi,winnerTeamId
                // Waiting for promises to finish
                Promise.all(promiseList).then(promiseListResp => {
                  for (let i = 0; i < promiseListResp.length; i += 1) {
                    if (promiseListResp[i] && promiseListResp[i].error) {
                      const { error } = promiseListResp[i];
                      return res.status(error.code).json(error);
                    }
                  }
                  if (err === null) {
                    // Converting filter array to object
                    if (validBody.filters) {
                      const tempFilters = {};
                      validBody.filters.forEach(filter => {
                        tempFilters[filter] = true;
                      });
                      validBody.filters = tempFilters;
                    }
                    // Updating new data to document
                    const existingFilters = existingDoc.filters;
                    const existingLiveStatus = existingDoc.liveStatus;
                    existingDoc.set(validBody);
                    existingDoc
                      .save()
                      .then(savedDoc => {
                        let series;
                        if (validBody.seriesId) {
                          series = promiseListResp[1]; // eslint-disable-line
                        } else {
                          series = savedDoc.seriesId;
                        }
                        let venue;
                        if (validBody.venue) {
                          venue = promiseListResp[3]; // eslint-disable-line
                        } else {
                          venue = savedDoc.venueId;
                        }
                        // Updating series table with team ref, venue object
                        // Checking if object already exist in matches
                        if (series.matches.indexOf(savedDoc.id) === -1) {
                          series.matches.push(savedDoc.id);
                        }
                        // Checking if object already exist in venueList
                        const existingVenue = series.venues.find(venueObj => {
                          if (venueObj) {
                            return venueObj.id === venue.id;
                          }
                          return false;
                        });
                        if (!existingVenue) {
                          series.venues.push(venue);
                        }
                        if (validBody.filters) {
                          ScoreCard.findOneAndUpdate(
                            {
                              matchId: savedDoc.id,
                              status: "active",
                            },
                            { filters: validBody.filters },
                            {
                              upsert: true,
                              new: true,
                            },
                          )
                            .then(() => {
                              logger.info(
                                `Scorecard updated with matchId: ${
                                  savedDoc.id
                                }`,
                              );
                            })
                            .catch(e => {
                              logger.error(e.message);
                              logger.error(
                                `Unable to Scorecard updated with matchId: ${
                                  savedDoc.id
                                }`,
                              );
                            });
                        }
                        series
                          .save()
                          .then(() => {
                            logger.info("Match info added to series list");
                            return true;
                          })
                          .catch(e => {
                            logger.error(e.message);
                            return false;
                          });
                        // TODO: Think about what to do with previously
                        // linked seried, team and venue if updated

                        // Creating newLiveMatch entry to redis if liveStatus is changing to ongoing
                        if (
                          existingLiveStatus !== "ongoing" &&
                          validBody.liveStatus &&
                          validBody.liveStatus === "ongoing"
                        ) {
                          // Adding task for parser to update scorecard in redis
                          const feedRef = savedDoc.references.find(
                            ref => ref.feedSource === savedDoc.activeFeedSource,
                          );
                          const predRef = savedDoc.references.find(
                            ref =>
                              ref.feedSource ===
                              savedDoc.activePredictionSource,
                          );
                          const work = {
                            matchId: savedDoc.id,
                            feedSource: feedRef && feedRef.feedSource,
                            feedSourceKey: feedRef && feedRef.key,
                            predictionSource: predRef && predRef.feedSource,
                            predictionSourceKey: predRef && predRef.key,
                          };

                          /* eslint-disable-next-line  */
                          pushQueue("newLiveMatch", work, (err, reply) => {
                            if (err === null && reply !== null) {
                              logger.info(JSON.stringify(reply));
                            } else {
                              logger.error(JSON.stringify(err));
                            }
                          });
                        }
                        // Creating newFeaturedMatch entry to redis if featured filter is added
                        if (validBody.filters) {
                          const isNewFeatured = validBody.filters.featured;
                          const isAlreadyFeatured = existingFilters.featured;
                          console.log(isNewFeatured  + " " + isAlreadyFeatured)
                          if (isNewFeatured && !isAlreadyFeatured) {
                            // Adding task for parser to update scorecard in redis
                            const feedRef = savedDoc.references.find(
                              ref =>
                                ref.feedSource === savedDoc.activeFeedSource,
                            );
                            const predRef = savedDoc.references.find(
                              ref =>
                                ref.feedSource ===
                                savedDoc.activePredictionSource,
                            );
                            const work = {
                              matchId: savedDoc.id,
                              feedSource: feedRef && feedRef.feedSource,
                              feedSourceKey: feedRef && feedRef.key,
                              predictionSource: predRef && predRef.feedSource,
                              predictionSourceKey: predRef && predRef.key,
                            };

                            pushQueue(
                              "newFeaturedMatch",
                              work,
                              /* eslint-disable-next-line  */
                              (err, reply) => {
                                if (err === null && reply !== null) {
                                  logger.info(JSON.stringify(reply));
                                } else {
                                  logger.error(JSON.stringify(err));
                                }
                              },
                            );
                          }
                          // removing match data from redis if featured filter is removed
                          if (isAlreadyFeatured && !isNewFeatured) {
                            const keys = [
                              `${savedDoc.id}MicroScorecard`,
                              `${savedDoc.id}FullScorecard`,
                              `${savedDoc.id}SummaryScorecard`,
                              `${savedDoc.id}Prediction`,
                            ];
                            /* eslint-disable-next-line  */
                            redisClient.del(keys, (err, response) => {
                              if (response === 1) {
                                redisClient.get(
                                  `featuredMatches`,
                                  /* eslint-disable-next-line  */
                                  (err, reply) => {
                                    if (err === null && reply) {
                                      const featuredMatches = JSON.parse(reply);
                                      redisClient.set(
                                        `featuredMatches`,
                                        JSON.stringify(
                                          featuredMatches.filter(
                                            featuredMatche =>
                                              featuredMatche !== savedDoc.id,
                                          ),
                                        ),
                                        /* eslint-disable-next-line  */
                                        (err, reply) => {
                                          if (reply) {
                                            logger.info(
                                              "Removed match from featured list",
                                            );
                                          } else {
                                            logger.error(
                                              `Unable to remove data from from featured list`,
                                            );
                                          }
                                        },
                                      );
                                    }
                                  },
                                );
                                logger.info("Match data removed from redis");
                              } else {
                                logger.error(
                                  `Unable to remove data from redis for matchId: ${
                                    savedDoc.id
                                  }`,
                                );
                              }
                            });
                          }
                        }
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
 * Delete match.
 * @returns {Match}
 */
function remove(req, res, next) {
  const schema = validator.remove;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      const { id } = validParam.params;
      // Updating status to deleted
      Match.update(
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
            message: `Unable to delete match id: ${id}`,
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
