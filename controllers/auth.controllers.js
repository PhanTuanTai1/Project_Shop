var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var merger = require('../middleware/merge');

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.login = (req,res) => {
    res.render('login',{
        showerror: false
    });
}

function getUser(email, callback) {
    
    var paramsEmail = {
        TableName : "Users",
        IndexName: "EmailIndex",
        KeyConditionExpression: "Email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    };

    docClient.query(paramsEmail, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            return callback(err);
        } else {
            console.log(data.Items);
            return callback(data.Items);
        }
    });

}

module.exports.loginPost = (req,res) => {
    var email = req.body.email;
    var password = req.body.password;
    
    getUser(email,async (respone) => {
        if(respone.length == 0) {
            res.render('login',{
                showerror: true
            });
            return;
        }

        if(respone[0].Password == password) {
            res.cookie('userID',respone[0].UserID,{
                signed: true
            });

            var userID = respone[0].UserID;
            var localData = req.cookies.cart;
            console.log(localData);
            if(localData==null){
                res.redirect('/');
            }

            var isSuccess = await merger.Merge(localData,userID);
            if(isSuccess) {
                res.clearCookie("cart");
            }

            res.redirect('/');
            return;
        }

        res.render('login',{
            showerror: true
        });
    });
}