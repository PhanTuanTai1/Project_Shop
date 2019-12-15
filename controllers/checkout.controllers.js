
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.getUser = (userID) => {
    return new Promise( async (resolve, reject) => {
        var paramsUserInfo = {
            TableName : "Users",
            KeyConditionExpression: "UserID = :id AND Varies = :varies",
            ExpressionAttributeValues: {
                ":id": userID,
                ":varies" : userID
            }
        }
        docClient.query(paramsUserInfo, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                return resolve(data.Items[0]);
            }
        });
    })
}


module.exports.getOrderTotalPrice = (orderID) => {
    return new Promise( async (resolve, reject) => {
        var paramsOrderDetail = {
            TableName : "Orders",
            KeyConditionExpression: "OrderID = :orderID",
            ExpressionAttributeValues: {
                ":orderID": orderID
            }
        };
        docClient.query(paramsOrderDetail, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                var total = 0;
                data.Items.forEach(element => {
                    total+=element.Price;
                });
                return resolve(total);
            }
        });
    })
}

module.exports.completeOrder = (UserID, Varies,Title, totalPrice, DetailInfo) => {
    return new Promise((resolve,reject) => {
        var params = {
            TableName: "Users",
            Key:{
                "UserID": UserID,
                "Varies": Varies
            },
            UpdateExpression: "set #st =:s,#ti = :ti,#sh = :sh,#de = :de,#tpr = :tt",
            ExpressionAttributeNames:{
                "#st": "Status",
                "#ti":"Title",
                "#sh":"ShipMoney",
                "#de":"DetailInfo",
                "#tpr":"TotalPrice"
            },
            ExpressionAttributeValues:{
                ":s": "Waiting",
                ":ti": Title,
                ":sh": "20000",
                ":de" : DetailInfo,
                ":tt": totalPrice
            },
            ReturnValues:"UPDATED_NEW"
        };

        docClient.update(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(err));
            } else {
                return resolve(true);
            }
        });
    })
}

