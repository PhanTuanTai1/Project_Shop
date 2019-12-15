var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();



module.exports.getAllOrder = (id) => {
    return new Promise( async (resolve, reject) => {
        var paramsAllOrderByCusID = {
            TableName : "Users",
            KeyConditionExpression: "UserID = :id",
            ExpressionAttributeValues: {
                ":id": id
            }
        }
        docClient.query(paramsAllOrderByCusID, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                let ls = [];
                for (var i = 0;i<data.Items.length;i++){
                    if(data.Items[i].UserID!=data.Items[i].Varies){
                        ls.push(data.Items[i]);
                    }
                }
                return resolve(ls);
            }
        });
    })
}

module.exports.getOrder = (id,varies) => {
    return new Promise( async (resolve, reject) => {
        var paramsAllOrderByCusID = {
            TableName : "Users",
            KeyConditionExpression: "UserID = :id AND Varies = :va",
            ExpressionAttributeValues: {
                ":id": id,
                ":va": varies
            }
        }
        docClient.query(paramsAllOrderByCusID, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                return resolve(data.Items[0]);
            }
        });
    })
}