var AWS = require("aws-sdk");
var cartController = require('../controllers/cart.controllers');

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.getAllCategory = (req,res) => {
    var paramsCategories = {
        TableName : "Others",
        ProjectionExpression: "SortKey",
        KeyConditionExpression: "PrimaryKey = :primaryKey",
        ExpressionAttributeValues: {
            ":primaryKey": "Category"
        }
    };
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
    }).then(result => {
        console.log(result);
        var paramsAllProductByCategory = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            ExpressionAttributeValues: {
                ":categoryName": result[0].SortKey
            },
            Limit : 6
        };
        docClient.query(paramsAllProductByCategory, async function (err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Query succeeded.");
                //Viet them code kiem tra order
                var quantity = 0;
                try {
                    var userID = req.signedCookies.userID;
                    var isValid = await cartController.checkUserIDValid(userID);
                    if (isValid) {
                        quantity = await cartController.getQuantityByIdCart(userID);
                    } else {
                        var cart = JSON.parse(req.cookies.cart);
                        quantity = await cartController.getQuantityByCookie(cart);
                    }
                }catch (e) {
                    quantity = 0;
                }
                //Viet them code kiem tra order

                res.render('shop', {
                    selected: 1,
                    category: result,
                    list_product: data.Items,
                    brand: data.Items,
                    objLast: data.LastEvaluatedKey,
                    QProduct: data.Items.length,
                    limit: 6,
                    quan:quantity
                });
            }
        });
        
    });
};
module.exports.getProductByCategory = (req,res) => {
    var paramsAllProductByCategory;
    if(req.query.pid == "null"){
        paramsAllProductByCategory = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            ExpressionAttributeValues: {
                ":categoryName": req.params.category
            },
            Limit : parseInt(req.query.Limit)
        }
        
    }
    else {
        paramsAllProductByCategory = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            ExclusiveStartKey: {
                "CategoryName": req.params.category,
                "ProductID": req.query.pid      
            },
            ExpressionAttributeValues: {
                ":categoryName": req.params.category,
            },
            Limit : parseInt(req.query.Limit)
        }
        paramsAllProductByCategory = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            ExclusiveStartKey: {
                "CategoryName": req.params.category,
                "ProductID": req.query.pid       
            },
            ExpressionAttributeValues: {
                ":categoryName": req.params.category,
            },
            Limit : parseInt(req.query.Limit)
        }
    }
    const promise = new Promise((resolve, reject) => {
        docClient.query(paramsAllProductByCategory, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Query succeeded.");
                return resolve(data);
            }
        });
    }).then(result => {
        console.log(result.LastEvaluatedKey);
        var params = {
            TableName : "Products",
                KeyConditionExpression: "CategoryName = :categoryName",
                ExpressionAttributeValues: {
                    ":categoryName": req.params.category
                },
        }
        docClient.query(params, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Query succeeded.");
                res.render('listProduct', { products : result.Items ,brand : result.Items,objLast : result.LastEvaluatedKey,QProduct : data.Items.length,limit:req.query.Limit});
            }
        });
        
    });
};
var paramsFilter;
function CreateParams(req){
    console.log(req.query.category);
    console.log(req.query.brand);
    console.log(req.query.color);
    console.log(req.query.minPrice);
    console.log(req.query.maxPrice);
    if(req.query.brand != "" && req.query.color != "" && req.query.minPrice != "" && req.query.maxPrice != "") {
        console.log("1");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            FilterExpression: "contains(:brand,Brand) AND contains(:color,Color) AND Price >= :minPrice AND Price <= :maxPrice",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
                ":brand" : req.query.brand,
                ":color" : req.query.color,
                ":minPrice" : parseInt(req.query.minPrice),
                ":maxPrice" : parseInt(req.query.maxPrice)
            },
            
        }
        
    }
    else if(req.query.brand != "" && req.query.color != ""){
        console.log("2");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            FilterExpression: "contains(:brand,Brand) AND contains(:color,Color)",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
                ":brand" : req.query.brand,
                ":color" : req.query.color,
            },
           
        }
    }
    else if(req.query.brand != "" && req.query.minPrice != "" && req.query.maxPrice != ""){
        console.log("3");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            FilterExpression: "contains(:brand,Brand) AND Price >= :minPrice AND Price <= :maxPrice",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
                ":brand" : req.query.brand,
                ":minPrice" : parseInt(req.query.minPrice),
                ":maxPrice" : parseInt(req.query.maxPrice)
            },
           
        }
    }
    else if(req.query.color != "" && req.query.minPrice != "" && req.query.maxPrice != ""){
        console.log("4");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            FilterExpression: "contains(:color,Color) AND Price >= :minPrice AND Price <= :maxPrice",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
                ":color" : req.query.color,
                ":minPrice" : parseInt(req.query.minPrice),
                ":maxPrice" : parseInt(req.query.maxPrice)
            },
            
        }
    }
    else if(req.query.brand != ""){
        console.log("5");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            FilterExpression: "contains(:brand,Brand)",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
                ":brand" : req.query.brand,
            },
            
        }
    }
    else if(req.query.color != ""){
        console.log("6");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            FilterExpression: "contains(:color,Color)",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
                ":color" : req.query.color,
            },
            
        }
    }
    else if(req.query.minPrice != "" & req.query.maxPrice != ""){
        console.log("7");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            FilterExpression: "Price >= :minPrice AND Price <= :maxPrice",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
                ":minPrice" : parseInt(req.query.minPrice),
                ":maxPrice" : parseInt(req.query.maxPrice)
            },
           
        }
    }
    else {
        console.log("8");
        paramsFilter = {
            TableName : "Products",
            KeyConditionExpression: "CategoryName = :categoryName",
            ExpressionAttributeValues: {
                ":categoryName": req.query.category,
            },
            
        }
    }
}

module.exports.Filter = (req,res) => {
    const promise = new Promise((resolve,reject) => {
        CreateParams(req);
        if(req.query.pid != null) {
            paramsFilter.ExclusiveStartKey = {
                "CategoryName": req.query.category,
                "ProductID": req.query.pid,
            }
        }
        //paramsFilter.Limit = req.query.Limit;
        docClient.query(paramsFilter,function(err,data){
            if(err) {
                console.log(err);
                reject();
            }
            else {
                console.log("Query succeeded")
                console.log(data.Items);
                return resolve(data);
            }
        })
    }).then(result => {
        console.log("Sum: " + result.Items.length);
        console.log(result.LastEvaluatedKey);
        paramsFilter.Limit = null;
        docClient.query(paramsFilter,function(err,data){
            if(err) console.log(err);
            else res.render('listProductByBrand',{products : result.Items,objLast : result.LastEvaluatedKey,QProduct : data.Items.length,limit : req.query.Limit});
        })
    });
}