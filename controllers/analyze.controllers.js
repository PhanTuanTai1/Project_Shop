var AWS = require("aws-sdk");
var linq = require('async-linq');

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.getAllUser = () => {
    return new Promise( async (resolve, reject) => {
        var params = {
            TableName : "Users"
        }
        docClient.scan(params, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                var lsUser = linq(data.Items)
                    .where(function (v) { if(v.UserID==v.Varies) return v; })
                    .run();
                return resolve(lsUser);
            }
        });
    })
}

module.exports.getAllOrder = () => {
    return new Promise( async (resolve, reject) => {
        var params = {
            TableName : "Users"
        }
        docClient.scan(params, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                var lsUser = linq(data.Items)
                    .where(function (v) { if(v.UserID!=v.Varies) return v; })
                    .run();
                return resolve(lsUser);
            }
        });
    })
}

module.exports.getAllOrderDetail = () => {
    return new Promise( async (resolve, reject) => {
        var params = {
            TableName : "Orders"
        }
        docClient.scan(params, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                return resolve(data.Items);
            }
        });
    })
}