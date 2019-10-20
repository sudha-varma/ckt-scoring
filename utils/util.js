// dependencies
import util from "util";
// const extend = require('node.extend');
import path from "path";
import uuidv1 from "uuid/v1";
import sha1 from "sha1";
import map from "lodash/map";
import messages from "../localization/en";
/**
 * Provides a set of utility functions used throughout the code base
 *
 * @module Services
 * @class Util
 * @constructor
 */
function Util() {}

/**
 * Clones an object by serializing it and then re-parsing it.
 * WARNING: Objects with circular dependencies will cause an error to be thrown.
 * @static
 * @method clone
 * @param {Object} object The object to clone
 * @return {Object|Array} Cloned object
 */
Util.clone = object => JSON.parse(JSON.stringify(object));

/**
 * Checks if the supplied object is an errof. If the object is an error the
 * function will throw the error.
 * @static
 * @method ane
 * @param {Object} obj The object to check
 */
Util.ane = obj => {
  if (util.isError(obj)) {
    throw obj;
  }
};

/**
 * Checks if the supplied object is an errof. If the object is an error the
 * function will throw the error.
 * @static
 * @method toCamelCase
 * @param {Object} obj The object to check
 */
Util.toCamelCase = (sentenceCase, splitString, isFirstLetterCaps) => {
  let out = "";
  sentenceCase.split(splitString).forEach((el, idx) => {
    const add = el.toLowerCase();
    if (!isFirstLetterCaps) {
      out += idx === 0 ? add : add[0].toUpperCase() + add.slice(1);
    } else {
      out += add[0].toUpperCase() + add.slice(1);
    }
  });
  return out;
};

/**
 * Initializes an array with the specified number of values.  The value at each
 * index can be static or a function may be provided.  In the event that a
 * function is provided the function will be called for each item to be placed
 * into the array.  The return value of the function will be placed into the
 * array.
 * @static
 * @method initArray
 * @param {Integer} cnt The length of the array to create
 * @param {Function|String|Number} val The value to initialize each index of
 * the array
 * @return {Array} The initialized array
 */
Util.initArray = (cnt, val) => {
  const v = [];
  const isFunc = Util.isFunction(val);
  for (let i = 0; i < cnt; i += 1) {
    v.push(isFunc ? val(i) : val);
  }
  return v;
};

/**
 * Merges the properties from the first parameter into the second. This modifies
 * the second parameter instead of creating a new object.
 *
 * @method merge
 * @param {Object} from
 * @param {Object} to
 * @return {Object} The 'to' variable
 */
Util.merge = (from, to) => {
  const dest = to;
  Util.forEach(from, (val, propName) => {
    dest[propName] = val;
  });
  return to;
};

/**
 * Creates an object that has both the properties of "a" and "b".  When both
 * objects have a property with the same name, "b"'s value will be preserved.
 * @static
 * @method union
 * @return {Object} The union of properties from both a and b.
 */
Util.union = (a, b) => {
  const union = {};
  Util.merge(a, union);
  Util.merge(b, union);
  return union;
};

/**
 * Provides an implementation of for each that accepts an array or object.
 * @static
 * @method forEach
 * @param {Object|Array} iterable
 * @param {Function} handler A function that accepts 4 parameters.  The value
 * of the current property or index.  The current index (property name if object).  The iterable.
 * Finally, the numerical index if the iterable is an object.
 */
Util.forEach = (iterable, handler) => {
  let internalHandler;
  let internalIterable;
  if (util.isArray(iterable)) {
    internalHandler = handler;
    internalIterable = iterable;
  } else if (Util.isObject(iterable)) {
    internalIterable = Object.getOwnPropertyNames(iterable);
    internalHandler = (propName, i) => {
      handler(iterable[propName], propName, iterable, i);
    };
  } else {
    return false;
  }

  // execute native foreach on interable
  internalIterable.forEach(internalHandler);
};

/**
 * Hashes an array
 * @static
 * @method arrayToHash
 * @param {Array} array      The array to hash
 * @param {*} [defaultVal=true] Default value if the hashing fails
 * @return {Object} Hash
 */
Util.arrayToHash = (array, defaultVal) => {
  let defaultValue = defaultVal;
  if (!util.isArray(array)) {
    return null;
  }

  // set the default value
  if (Util.isNullOrUndefined(defaultValue)) {
    defaultValue = true;
  }
  const hash = {};
  for (let i = 0; i < array.length; i += 1) {
    if (Util.isFunction(defaultValue)) {
      hash[defaultValue(array, i)] = array[i];
    } else {
      hash[array[i]] = defaultValue;
    }
  }
  return hash;
};

/**
 * Converts an array to an object.
 * @static
 * @method arrayToObj
 * @param {Array} array The array of items to transform from an array to an
 * object
 * @param {String|Function} keyFieldOrTransform When this field is a string it
 * is expected that the array contains objects and that the objects contain a
 * property that the string represents.  The value of that field will be used
 * as the property name in the new object.  When this parameter is a function
 * it is passed two parameters: the array being operated on and the index of
 * the current item.  It is expected that the function will return a value
 * representing the key in the new object.
 * @param {String|Function} [valFieldOrTransform] When this value is a string
 * it is expected that the array contains objects and that the objects contain
 * a property that the string represents.  The value of that field will be used
 * as the property value in the new object.  When this parameter is a function
 * it is passed two parameters: the array being operated on and the index of
 * the current item.  It is expected that the function return a value
 * representing the value of the derived property for that item.
 * @return {Object} The converted array.
 */
Util.arrayToObj = (array, keyFieldOrTransform, valFieldOrTransform) => {
  let valFieldOrTransformCopy = valFieldOrTransform;
  if (!util.isArray(array)) {
    return null;
  }

  const keyIsString = Util.isString(keyFieldOrTransform);
  const keyIsFunc = Util.isFunction(keyFieldOrTransform);
  if (!keyIsString && !keyIsFunc) {
    return null;
  }

  const valIsString = Util.isString(valFieldOrTransformCopy);
  const valIsFunc = Util.isFunction(valFieldOrTransformCopy);
  if (!valIsString && !valIsFunc) {
    valFieldOrTransformCopy = null;
  }

  const obj = {};
  for (let i = 0; i < array.length; i += 1) {
    const item = array[i];
    const key = keyIsString
      ? item[keyFieldOrTransform]
      : keyFieldOrTransform(array, i);

    if (valIsString) {
      obj[key] = item[valFieldOrTransform];
    } else if (valIsFunc) {
      obj[key] = valFieldOrTransform(array, i);
    } else {
      obj[key] = item;
    }
  }
  return obj;
};

/**
 * Converts an array of objects into a hash where the key the value of the
 * specified property. If multiple objects in the array have the same value for
 * the specified value then the last one found will be kept.
 * @static
 * @method objArrayToHash
 * @param {Array} array The array to convert
 * @param {String} hashProp The property who's value will be used as the key
 * for each object in the array.
 * @return {Object} A hash of the values in the array
 */
Util.objArrayToHash = (array, hashProp) => {
  if (!util.isArray(array)) {
    return null;
  }

  const hash = {};
  for (let i = 0; i < array.length; i += 1) {
    hash[array[i][hashProp]] = array[i];
  }
  return hash;
};

/**
 * Converts a hash to an array. When provided, the hashKeyProp will be the
 * property name of each object in the array that holds the hash key.
 * @static
 * @method hashToArray
 * @param {Object} obj The object to convert
 * @param {String} [hashKeyProp] The property name that will hold the hash key.
 * @return {Array} An array of each property value in the hash.
 */
Util.hashToArray = (obj, hashKeyProp) => {
  const objCopy = obj;
  if (!Util.isObject(objCopy)) {
    return null;
  }

  const doHashKeyTransform = Util.isString(hashKeyProp);
  return Object.keys(objCopy).reduce((prev, prop) => {
    prev.push(objCopy[prop]);
    if (doHashKeyTransform) {
      objCopy[prop][hashKeyProp] = prop;
    }
    return prev;
  }, []);
};

/**
 * check if array is Equal
 * @static
 * @method isArrayEqual
 * @param {Array} _arr1 array
 * @param {Array} _arr2 array
 * @return {Object} Inverted hash
 */
Util.isArrayEqual = (_arr1, _arr2) => {
  if (
    !Array.isArray(_arr1) ||
    !Array.isArray(_arr2) ||
    _arr1.length !== _arr2.length
  )
    return false;

  const arr1 = _arr1.concat().sort();
  const arr2 = _arr2.concat().sort();

  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
};

/**
 * Inverts a hash
 * @static
 * @method invertHash
 * @param {Object} obj Hash object
 * @return {Object} Inverted hash
 */
Util.invertHash = obj => {
  if (!Util.isObject(obj)) {
    return null;
  }

  const newObj = {};
  Object.keys(obj).forEach(key => {
    const prop = obj[key];
    newObj[obj[prop]] = prop;
  });
  return newObj;
};

/**
 * Group Objects of array by key
 * @static
 * @method groupBy
 * @param {Array} Array of object
 * @return {Object}
 */
Util.groupBy = (array, keyOrIterator) => {
  let iterator;
  let key;

  // use the function passed in, or create one
  if (typeof key !== "function") {
    key = String(keyOrIterator);
    iterator = item => item[key];
  } else {
    iterator = keyOrIterator;
  }

  return array.reduce((memo, item) => {
    const memoCopy = memo;
    key = iterator(item);
    memoCopy[key] = memoCopy[key] || [];
    memoCopy[key].push(item);
    return memoCopy;
  }, {});
};

/**
 * Clones an array
 * @static
 * @method copyArray
 * @param {Array} array
 * @return {Array} Cloned array
 */
Util.copyArray = array => {
  if (!util.isArray(array)) {
    return null;
  }

  const clone = [];
  for (let i = 0; i < array.length; i += 1) {
    clone.push(array[i]);
  }
  return clone;
};

Util.dedupeArray = array => {
  const hash = Util.arrayToHash(array);
  return Object.keys(hash);
};

/**
 * Pushes all of one array's values into another
 * @static
 * @method arrayPushAll
 * @param {Array} from
 * @param {Array} to
 * @return {Boolean} FALSE when the parameters are not Arrays
 */
Util.arrayPushAll = (from, to) => {
  if (!util.isArray(from) || !util.isArray(to)) {
    return false;
  }

  for (let i = 0; i < from.length; i += 1) {
    to.push(from[i]);
  }
};

/**
 * Empty callback function just used as a place holder if a callback is required
 * and the result is not needed.
 * @static
 * @method cb
 */
Util.cb = (/* err, result */) => {
  // do nothing
};

/**
 * Creates a unique Id
 * @static
 * @method randomNumberGenerator
 * @return {String} Unique Id Object
 */
Util.randomNumberGenerator = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Creates a unique Id
 * @static
 * @method uniqueId
 * @return {String} Unique Id Object
 */
Util.uniqueId = () => Util.randomNumberGenerator(100000000, 9999999999999999);

/**
 * Tests if a value is an object
 * @static
 * @method isObject
 * @param {*} value
 * @return {Boolean}
 */
Util.isObject = value =>
  !Util.isNullOrUndefined(value) && typeof value === "object";

/**
 * Tests if a value is an string
 * @static
 * @method isString
 * @param {*} value
 * @return {Boolean}
 */
Util.isString = value =>
  !Util.isNullOrUndefined(value) && typeof value === "string";

/**
 * Tests if a value is a function
 * @static
 * @method isFunction
 * @param {*} value
 * @return {Boolean}
 */
Util.isFunction = value =>
  !Util.isNullOrUndefined(value) && typeof value === "function";

/**
 * Tests if a value is NULL or undefined
 * @static
 * @method isNullOrUndefined
 * @param {*} value
 * @return {Boolean}
 */
Util.isNullOrUndefined = value =>
  value === null || typeof value === "undefined";

/**
 * Tests if a value is a boolean
 * @static
 * @method isBoolean
 * @param {*} value
 * @return {Boolean}
 */
Util.isBoolean = value => value === true || value === false;

/**
 * Tests if a value is a boolean
 * @static
 * @method isBoolean
 * @param {*} value
 * @return {Boolean}
 */
Util.generateSalt = () => uuidv1();

/**
 * Tests if a value is a boolean
 * @static
 * @method isBoolean
 * @param {*} value
 * @return {Boolean}
 */
Util.hashPassword = (password, salt) => sha1(password + salt);

/**
 * Retrieves the extension off of the end of a string that represents a URI to
 * a resource
 * @static
 * @method getExtension
 * @param {String} filePath URI to the resource
 * @param {Object} [options]
 * @param {Boolean} [options.lower=false] When TRUE the extension will be returned as lower case
 * @param {String} [options.sep] The file path separator used in the path.  Defaults to the OS default.
 * @return {String} The value after the last '.' character
 */
Util.getExtension = (filePath, options) => {
  let optionsCopy = options;
  let filePathCopy = filePath;
  if (!Util.isString(filePathCopy) || filePathCopy.length <= 0) {
    return null;
  }
  if (!Util.isObject(optionsCopy)) {
    optionsCopy = {};
  }

  // do to the end of the path
  const pathPartIndex = filePathCopy.lastIndexOf(options.sep || path.sep) || 0;
  if (pathPartIndex > -1) {
    filePathCopy = filePathCopy.substr(pathPartIndex);
  }

  let ext = null;
  const index = filePath.lastIndexOf(".");
  if (index >= 0) {
    ext = filePath.substring(index + 1);

    // apply options
    if (options.lower) {
      ext = ext.toLowerCase();
    }
  }
  return ext;
};

/**
 * Creates a filter function to be used with the getFiles function to skip files that are not of the specified type
 * @static
 * @method getFileExtensionFilter
 * @param extension
 * @return {Function}
 */
Util.getFileExtensionFilter = extension => {
  const ext = `.${extension}`;
  return fullPath => fullPath.lastIndexOf(ext) === fullPath.length - ext.length;
};

/**
 * Creates a filter function to be used with the errors thrown from JOI
 * @static
 * @method FormatJOIError
 * @param err
 * @param useJoiError
 * @return {Function}
 */
Util.FormatJOIError = err => {
  // Joi Error
  const JoiError = {
    code: 400,
    data:
      // fetch only message and path from each error
      /* eslint-disable-next-line  */
      map(err.details, ({ message, path }) => ({
        [path]: message.replace(/['"]/g, ""),
      })),
    message: messages.INVALID_DATA,
  };
  // Send back the JSON error response
  return JoiError;
};
Util.ThrowError = ({ code = 422, message, isPublic = true }) => {
  const error = {
    status: code,
    message,
    isPublic,
  };
  throw error;
};
Util.parseSortBy = sortBy => {
  let sort = {};
  if (sortBy) {
    // Parse sort keys
    sortBy.forEach(key => {
      let sortKey = key;
      let desc = false;
      if (key.startsWith("-")) {
        [, sortKey] = key.split("-");
        desc = true;
      }
      if (sortKey === "featured") {
        sortKey = "filters.featured";
      }
      sort[sortKey] = 1;
      if (desc) {
        sort[sortKey] = -1;
      }
    });
  } else {
    sort = { createdAt: -1 };
  }
  return sort;
};

// exports
export default Util;
