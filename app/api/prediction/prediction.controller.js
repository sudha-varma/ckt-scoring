import Prediction from "./prediction.model";
import validator from "./prediction.validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";
import Match from "../match/match.model";

/**
 * Get Prediction
 * @returns {Prediction}
 */
function get(req, res, next) {
  const schema = validator.get;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting prediction details
      const { matchId } = validParam.params;
      // Validating req query
      /* eslint-disable-next-line  */
      schema.validate({ query: req.query }, (err, validQuery) => {
        /* eslint-disable-next-line  */
        Prediction.findOne({ matchId, status: "active" })
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
      });
    } else {
      return res.status(400).json(util.FormatJOIError(err));
    }
    return true;
  });
}

/**
 * Get prediction list.
 * @property {number} req.query.skip - Number of prediction to be skipped.
 * @property {number} req.query.limit - Limit number of prediction to be returned.
 * @property {array} req.query.sortBy - keys to use to record sorting.
 * @returns {Prediction[]}
 */
function list(req, res, next) {
  const schema = validator.list;
  // Validating req query
  schema.validate({ query: req.query }, (err, validQuery) => {
    if (err === null) {
      const { limit = 50, skip = 0, sortBy } = validQuery.query;
      const filterCriteria = {
        status: "active",
      };
      // Getting prediction list with filters
      Prediction.find(filterCriteria)
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
 * Create new prediction
 * @property {string} req.body.matchId - match id.
 * @property {string} req.body.data - match prediction object.
 * @returns {Prediction}
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
        Prediction.findOneAndUpdate(
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
 * Update existing prediction
 * @property {string} req.body.data - match prediction object.
 * @returns {Prediction}
 */
function update(req, res, next) {
  const schema = validator.update;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting prediction object to be updated
      const { matchId } = validParam.params;
      Prediction.findOne({ matchId, status: "active" })
        .exec()
        .then(existingDoc => {
          if (existingDoc !== null) {
            // Validating request body
            /* eslint-disable-next-line  */
            schema.validate({ body: req.body }, (err, validData) => {
              if (err === null) {
                const validBody = validData.body;
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
 * Delete prediction.
 * @returns {Prediction}
 */
function remove(req, res, next) {
  const schema = validator.remove;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Updating status to deleted
      const { matchId } = validParam.params;
      Prediction.update(
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
            message: `Unable to delete prediction with matchId: ${matchId}`,
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
