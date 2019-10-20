import aws from "aws-sdk";
import messages from "../localization/en";
const config = require("../config");

aws.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});
const s3 = new aws.S3();

/**
 * S3 File Service
 *
 * @module Service
 * @class s3Service
 * @constructor
 */
function s3Service() {}

s3Service.uploadFile = (
  res,
  data,
  bucketName,
  s3FolderName,
  fileName,
  contentType,
  cb,
) => {
  const key = s3FolderName + fileName;

  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    Body: data,
  };

  s3.putObject(params, (err, response) => {
    if (response && response.ETag) {
      if (cb) {
        cb();
      } else {
        res
          .status(200)
          .send({ code: 900, message: messages.FILE_UPLOADED_SUCCESSFULLY });
      }
    } else {
      res.send(500);
    }
  });
};

// exports
export default s3Service;
