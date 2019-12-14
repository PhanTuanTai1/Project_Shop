var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.search = (req,res) => {
    var searchString = req.params.searchString;

    console.log(req.params.searchString);

    if(req.params.searchString !== undefined && searchString.trim() !== '') {
        //res.end(searchString);

        var paramsAllProduct = {
            TableName : "Products",
            FilterExpression: "contains(ProductName,:productName) ",
            ExpressionAttributeValues: {
                ":productName": searchString.trim()
            },
            Limit : 6
        };
        docClient.scan(paramsAllProduct, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                if(data.Items.length > 0)
                    res.render('shop', { selected: 1,category : [],list_product : data.Items,brand:[],objLast : data.LastEvaluatedKey,QProduct : data.Items.length,limit:6 });
                else {
                    var paramsAll = {
                        TableName : "Products",
                        Limit : 6
                    };
                    docClient.scan(paramsAll, function(err, data) {
                        if (err) {
                            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                            reject();
                        } else {
                            if(data.Items.length > 0)
                                res.render('shop', { selected: 1,category : [],list_product : data.Items,brand:data.Items,objLast : data.LastEvaluatedKey,QProduct : data.Items.length,limit:6 });
                        }
                    });
                }
            }
        });


    }

   
}