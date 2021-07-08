import { config } from "../config.js";
import AWS from 'aws-sdk/global.js';
import Lambda from 'aws-sdk/clients/lambda.js';
AWS.config.region = config['AWS_REGION']
var lambda = new Lambda()

export const InvokeBoilerPlateLambda = function invokeLambda2(orgId, serviceId) {
  var params = {
    FunctionName: config['NODEJS_BOILERPLATE_ARN'],
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify({
      "orgId": orgId,
      "serviceId": serviceId
    })
  };
  return new Promise((resolve, reject) => {
    lambda.invoke(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      }
      else {
        console.log(data);
        resolve(JSON.parse(data.Payload));
      }
    });
  });
}
