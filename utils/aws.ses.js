import aws from "aws-sdk";
import config from "../config";

const { fromAddress } = config.aws.ses;

aws.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.ses.region,
});

/**
 * SES Email Service
 *
 * @module Service
 * @class sesEmailService
 * @constructor
 */
function sesEmailService() {}

sesEmailService.sendEmail = (toAddress, msgSubject, msgBody) => {
  const params = {
    Source: fromAddress,
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: msgBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: msgSubject,
      },
    },
  };
  // Create the promise and SES service object
  const sendPromise = new aws.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(data => {
      console.log(data.MessageId);
    })
    .catch(err => {
      console.error(err, err.stack);
    });
};

// exports
export default sesEmailService;
