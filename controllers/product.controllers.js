var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.getProductByID = (id) => {
    return new Promise( async (resolve, reject) => {
        var paramsProductID = {
            TableName : "Products",
            IndexName : "ProductIDIndex",
            KeyConditionExpression: "ProductID = :productID",
            ExpressionAttributeValues: {
                ":productID": id
            }
        };
        docClient.query(paramsProductID, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                return resolve(data.Items[0]);
            }
        });
    })
}
