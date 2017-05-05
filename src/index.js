/**
 * Created by jiangq on 2016/11/1.
 * Description: a grpc promisify hack module
 */

const grpc = require('grpc');

/**
 * promisify
 * @param client grpc client
 */
function promisify(client) {
  Object.keys(Object.getPrototypeOf(client)).forEach(functionName => {
    const originalFunction = client[functionName];

    client[functionName] = (request, callback) => {
      if (callback && typeof callback === 'function') {
        return originalFunction.call(client, request, (error, response) => {
          callback(error, response);
        });
      }

      return new Promise((resolve, reject) => {
        grpc.waitForClientReady(client, Infinity, function (error) {
          if (error) {
            reject(error);
            return;
          }
          originalFunction.call(client, request, (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        });
      });
    };
  });
}

module.exports = promisify;
