import AWS from 'aws-sdk/global.js';
import Lambda from 'aws-sdk/clients/lambda.js';
AWS.config.region = 'us-east-1';
var lambda = new Lambda()

export const InvokeBoilerPlateLambda = function (orgId, serviceId) {
  var params = {
    FunctionName: 'BOILERPLATE_LAMBDA_ARN',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify({
      "orgId": orgId,
      "serviceId": serviceId
    })
  };
  lambda.invoke(params, function (err, data) {
    if (err) {
      console.log(err)
      return 'success'
    } else {
      return 'failed'
    }
  })
};