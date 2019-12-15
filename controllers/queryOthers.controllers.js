var AWS = require("aws-sdk");
var cartController = require('../controllers/cart.controllers');
AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var paramsCategories = {
    TableName : "Others",
    ProjectionExpression: "SortKey",
    KeyConditionExpression: "PrimaryKey = :primaryKey",
    ExpressionAttributeValues: {
        ":primaryKey": "Category"
    }
};

var paramsHot = {
    TableName : "Others",
    KeyConditionExpression: "PrimaryKey = :primaryKey",
    ExpressionAttributeValues: {
        ":primaryKey": "Hot"
    }
}
/*

// Danh sách category --> với từng category thì hiển thị ra tất cả sản phẩm thuộc category đó

const promise = new Promise((resolve, reject) => {
    docClient.query(paramsCategories, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            reject();
        } else {
            console.log("Query succeeded.");
            return resolve(data.Items)
        }
    });
})

promise.then(function(categories) {

    categories.forEach(cate => {
        var paramsAllProductByCategory = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            ExpressionAttributeValues: {
                ":categoryName": cate.SortKey
            }
        }

        docClient.query(paramsAllProductByCategory, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                console.log("Query succeeded.");
                console.log(data.Items);
            }
        });
    })

});*/



// Danh sách sản phẩm hot --> với từng sản phẩm đó thì hiển thị ra tất cả thông tin của sản phẩm

// Call DynamoDB API to get list productID
function getListProductID(){
    return new Promise((resolve,reject) => {
        docClient.query(paramsHot, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                resolve(data.Items)
            }
        });
    })
}


function asyncFunction(item) {
    
   return new Promise((resolve, reject) => {
    var paramsProductID = {
        TableName : "Products",
        IndexName : "ProductIDIndex",
        KeyConditionExpression: "ProductID = :productID",
        ExpressionAttributeValues: {
            ":productID": item.SortKey
        }
    };

    docClient.query(paramsProductID, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            return err;
        } else {
            resolve(data.Items[0]);
        }
    });
   })
}

module.exports.Index = async function Init(req,res) {
    var array = await getListProductID();
    // foreach productID to get all
    let promiseArray = array.map(asyncFunction);

    Promise.all(promiseArray).then(result => {
        console.log(JSON.stringify(result));
        res.render('index', { selected: 0, list_product: result });
    });
} 

