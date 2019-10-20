import Series from "./series.model";
import validator from "./series.validator";
import util from "../../../utils/util";
import messages from "../../../localization/en";

/**
 * Get Series
 * @returns {Series}
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
      // Getting series details
      Series.findOne(filterCriteria)
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
 * Get series list.
 * @property {array} req.query.filters - Array of series filters.
 * @property {array} req.query.approvalStatus - Array of approval status.
 * @property {array} req.query.format - Array of series formats.
 * @property {array} req.query.liveStatus - Array of series live status.
 * @property {number} req.query.skip - Number of series to be skipped.
 * @property {number} req.query.limit - Limit number of series to be returned.
 * @property {array} req.query.sortBy - keys to use to record sorting.
 * @returns {Series[]}
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
      // Getting series list with filters
      Series.find(filterCriteria)
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
 * Create new series
 * @property {string} req.body.name - The name of series.
 * @property {string} req.body.shortName - The short name of series.
 * @property {string} req.body.displayName - The display name of series.
 * @property {string} req.body.format - The format of series.
 * @property {string} req.body.filters - The filters type for the series.
 * @property {string} req.body.liveStatus - The liveStatus for the series.
 * @property {date} req.body.startDate - The start date of series.
 * @property {date} req.body.endDate - The end date of series.
 * @property {string} req.body.activeFeedSource - The current active feed source of series.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of series.
 * @property {string} req.body.approvalStatus - The approval status of series.
 * @returns {Series}
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
          Series.findOne({
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
        // Converting filter array to object
        if (validBody.filters) {
          const tempFilters = {};
          validBody.filters.forEach(filter => {
            tempFilters[filter] = true;
          });
          validBody.filters = tempFilters;
        }
        const newDoc = new Series(validBody);
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
 * Update existing series
 * @property {string} req.body.name - The name of series.
 * @property {string} req.body.shortName - The short name of series.
 * @property {string} req.body.displayName - The display name of series.
 * @property {string} req.body.format - The format of series.
 * @property {string} req.body.filters - The filters type for the series.
 * @property {string} req.body.liveStatus - The liveStatus for the series.
 * @property {date} req.body.startDate - The start date of series.
 * @property {date} req.body.endDate - The end date of series.
 * @property {string} req.body.activeFeedSource - The current active feed source of series.
 * @property {string} req.body.reference - The reference object {feedSource: x, key:y} of series.
 * @property {string} req.body.approvalStatus - The approval status of series.
 * @returns {Series}
 */
function update(req, res, next) {
  const schema = validator.update;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Getting series object to be updated
      Series.findOne({ _id: validParam.params.id, status: "active" })
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
                    Series.findOne({
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
 * Delete series.
 * @returns {Series}
 */
function remove(req, res, next) {
  const schema = validator.remove;
  // Validating req param
  schema.validate({ params: req.params }, (err, validParam) => {
    if (err === null) {
      // Updating status to deleted
      const { id } = validParam.params;
      Series.update(
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
            message: `Unable to delete series id: ${id}`,
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
