var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.requiredAuth = (req,res,next) => {

    var userID = req.signedCookies.userID;

    if(!userID) {
        res.redirect('/auth/login');
        return;
    }

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
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log('im here');
            //console.log(data.Items);
            if(data.Items.length <= 0) {
                res.redirect('/auth/login');
                return;
            }

            next();
        }
    });
}

module.exports.requiredAdminAuth = (req,res,next) => {

    var userID = req.signedCookies.userID;

    if(!userID) {
        // redirect về user
        res.redirect('/auth/login');
        return;
    }

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
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log('im here');
            //console.log(data.Items);
            if(data.Items.length <= 0) {
                // redirect về user
                res.redirect('/auth/login');
                return;
            }
            //Check kỹ
            if(data.Items[0].Type =="Admin"){
                next();
            }
        }
    });
}

