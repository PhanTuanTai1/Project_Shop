var AWS = require("aws-sdk");
var formidable = require("formidable");
var fs = require("fs");

// AWS.config.update({
//     region: "us-west-2",
//     accessKeyId: "accessKeyId",
//     secretAccessKey: "secretAccessKey",
//     endpoint: "http://localhost:8000"
// });
AWS.config.update({
    region: "us-west-2",
    accessKeyId: "AKIAIOWR4C2QRAMPFF4A",
    secretAccessKey: "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",
    endpoint: "dynamodb.us-west-2.amazonaws.com"
  });

var docClient = new AWS.DynamoDB.DocumentClient();
// var upload = require("./upload.controller");
module.exports.CategoryManagement = (res) => {
    ReturnCategoryList(res);
};
module.exports.AddCategory = (req,res) => {
    console.log(req.body.categoryName);
    var params = {
        TableName: "Others",
        Item: {
            "PrimaryKey" : "Category",
            "SortKey" : req.body.categoryName
        }
    };
    docClient.put(params,function(err,data){
        if(err) console.log(err);
        else {
            res.end();
        }
    })
}
function ReturnCategoryList(res){
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
        res.render('CategoryManagement',{data : result});
    });
}
function ReturnListProduct(req,res){
    var params = {
        TableName : "Others",
        KeyConditionExpression : "PrimaryKey = :primarykey",
        ExpressionAttributeValues :{
            ":primarykey" : "Category"
        }
    }
    docClient.query(params,function(err,data){
        if(err) console.log(err);
        else {
            var paramsAllProductByCategory = {
                TableName : "Products",
                KeyConditionExpression: "CategoryName = :categoryName",
                ExpressionAttributeValues: {
                    ":categoryName": data.Items[0].SortKey,
                },
        }
        const promise = new Promise((resolve, reject) => {
            docClient.query(paramsAllProductByCategory, function(err, data) {
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
            var paramsCategories = {
                TableName : "Others",
                ProjectionExpression: "SortKey",
                KeyConditionExpression: "PrimaryKey = :primaryKey",
                ExpressionAttributeValues: {
                    ":primaryKey": "Category"
                }
            };
            docClient.query(paramsCategories, function(err, data) {
                if (err) {
                    console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    reject();
                } else {
                    console.log("Query succeeded.");
                    res.render('ProductManagement',{products : result,categorys : data.Items});
                }
            });
           
        });
        }
    });
}
module.exports.ProductManagement = (req,res) => {
    ReturnListProduct(req,res);
}
function ReturnListProductAdmin(req,res){
    var paramsAllProductByCategory = {
        TableName : "Products",
        KeyConditionExpression: "CategoryName = :categoryName",
        ExpressionAttributeValues: {
            ":categoryName": req.params.category,
        },
}
const promise = new Promise((resolve, reject) => {
    docClient.query(paramsAllProductByCategory, function(err, data) {
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
    res.render('ListProductAdmin',{products : result});      
    });
}
module.exports.ListProductAdmin = (req,res) =>{
    ReturnListProductAdmin(req,res);
}
module.exports.ReturnFormAdd = (res) => {
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
        res.render('FormAddProduct',{categorys : result});
    });
}
module.exports.AddProduct = (req,res) => {
    var randomID = "P" + parseInt(Math.random() * 1000);
        var paramCheck  = {
            TableName : "Products",
            IndexName : "ProductIDIndex",
            KeyConditionExpression: "ProductID = :productID",
            ExpressionAttributeValues: {
                ":productID": randomID
            }
        }
        docClient.query(paramCheck,function check(err,data){
            if(err) console.log(JSON.stringify(err));
            else {
                  if(data.Items.length == 0) {
                    console.log("Begin Add");
                    AddProduct(req,res,randomID);
                }else {
                    randomID = "P" + parseInt(Math.random() * 1000);
                    paramCheck.ExpressionAttributeValues = {
                        ":productID": randomID
                    }
                    docClient.query(paramCheck,check());
                }
            }
        })   
}
function AddProduct(req,res,pid){
    let listName = [];
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) console.log(err);
        else {         
            let s3Bucket = new AWS.S3({
                accessKeyId: "AKIAIOWR4C2QRAMPFF4A",
                secretAccessKey: "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",
                Bucket: "shopbucket123",
                ACL: 'public-read',
                endpoint: "https://s3.amazonaws.com"     
            })
            s3Bucket.createBucket(function(){
                let fileStream = fs.createReadStream(files.files.path);
                fileStream.on('error', function(err) {
                console.log('File Error', err);
                });
                var params = {
                    Bucket: "shopbucket123",
                    ACL: 'public-read',
                    Key : files.files.name,
                    Body : fileStream   
                }
                
                s3Bucket.upload(params,function(err,data){
                    if(err) console.log(err);
                    else {
                        var params = {
                            TableName : "Products",
                            Item : {
                                "CategoryName" : fields.CategoryName,
                                "ProductID" : pid,
                                "ProductName" : fields.ProductName,
                                "Brand" : fields.Brand,
                                "Price" : fields.Price,
                                "Color" : fields.Color,
                                "Picture" : data.Location
                            }
                        }
                        docClient.put(params,function(err,data){
                            if(err) console.log(err);
                            else {
                                res.redirect("/admin/ProductManagement");
                            }
                        })
                    }
                })
            });   
            
        }
    })
}
function ReturnFormEdit(req,res){
    var paramsProductID = {
        TableName : "Products",
        IndexName : "ProductIDIndex",
        KeyConditionExpression: "ProductID = :productID",
        ExpressionAttributeValues: {
            ":productID": req.params.pid
        }
    };
    docClient.query(paramsProductID,(err,data) => {
        if(err) console.log(JSON.stringify(err));
        else {
            console.log(data.Items);
            var paramsCategories = {
                TableName : "Others",
                ProjectionExpression: "SortKey",
                KeyConditionExpression: "PrimaryKey = :primaryKey",
                ExpressionAttributeValues: {
                    ":primaryKey": "Category"
                }
            };
            docClient.query(paramsCategories,function(err,data2){
                if(err) console.log(err);
                else {
                    res.render("FormEditProduct",{product : data.Items[0],categorys : data2.Items});  
                }
            })        
              
        }
    })
}
module.exports.ReturnFormEdit = (req,res) => {
    ReturnFormEdit(req,res);
}
function EditProduct(req,res){

    let form = new formidable.IncomingForm();
    //form.uploadDir = "public/img/"
    form.parse(req, function(err, fields, files){
        if(err) console.log(err);
        else {
            console.log(fields.Brand);
            console.log(fields.ProductID);
            console.log(fields.CategoryName);
            console.log(fields.Price);
            console.log(fields.Color);     
                if (files.files.name == ""){
                    var params = {
                        TableName: "Products",
                        Key:{
                            "CategoryName": fields.CategoryName,
                            "ProductID": fields.ProductID
                        },
                        UpdateExpression: "set Brand = :b, Price=:p,ProductName = :pn, Color = :c",
                        ExpressionAttributeValues:{
                            ":b":fields.Brand,
                            ":p": fields.Price,
                            ":pn" : fields.ProductName,
                            ":c" : fields.Color,                           
                        },
                        ReturnValues:"UPDATED_NEW"
                    };
                    docClient.update(params,function(err,data){
                        if(err) console.log(err);
                        else {
                            res.redirect("/admin/ProductManagement");
                        }
                    })
                }
                else {
                    let s3Bucket = new AWS.S3({
                        accessKeyId: "AKIAIOWR4C2QRAMPFF4A",
                        secretAccessKey: "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",
                        Bucket: "shopbucket123",
                        ACL: 'public-read',
                        endpoint: "https://s3.amazonaws.com"     
                    })
                    s3Bucket.createBucket(function(){
                        let fileStream = fs.createReadStream(files.files.path);
                        fileStream.on('error', function(err) {
                        console.log('File Error', err);
                        });
                        var params = {
                            Bucket: "shopbucket123",
                            ACL: 'public-read',
                            Key : files.files.name,
                            Body : fileStream,
                            
                        }
                        
                        s3Bucket.upload(params,function(err,data){
                            if(err) console.log(err);
                            else {
                                var params = {
                                    TableName: "Products",
                                    Key:{
                                        "CategoryName": fields.CategoryName,
                                        "ProductID": fields.ProductID
                                    },
                                    UpdateExpression: "set Brand = :b, Price=:p, Picture = :pt,ProductName = :pn,Color = :c",
                                    ExpressionAttributeValues:{
                                        ":b":fields.Brand,
                                        ":p": fields.Price,
                                        ":pt":data.Location,
                                        ":pn" : fields.ProductName,
                                        ":c" : fields.Color
                                    },
                                    ReturnValues:"UPDATED_NEW"
                                };
                                docClient.update(params,function(err,data){
                                    if(err) console.log(err);
                                    else {
                                        res.redirect("/admin/ProductManagement");
                                    }
                                })
                            }
                        });
                   
                });
            }
           
        }
    })
}
module.exports.EditProduct = (req,res) => {
    EditProduct(req,res);
}
module.exports.DeleteProduct = (req,res) => {
    console.log(req.query.category);
    console.log(req.params.pid);
    var params = {
        TableName: "Products",
        Key:{
            "CategoryName": req.query.category,
            "ProductID": req.params.pid
        },
        ConditionExpression:"ProductID = :val",
        ExpressionAttributeValues: {
            ":val": req.params.pid,
            
        }
    };
    console.log("Attempting a conditional delete...");
    docClient.delete(params, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            ReturnListProduct(req,res);
        }
    });
}
    



module.exports.OrderManagement = (req,res) => {
    var paramsOrderID = {
        TableName : "Users",
        IndexName: "StatusIndex",
        KeyConditionExpression: "#st = :status",
        ExpressionAttributeNames:{
            "#st": "Status"
        },
        ExpressionAttributeValues: {
            ":status": "Waiting"
        }
    }
    const promise = new Promise((resolve, reject) => {
        docClient.query(paramsOrderID, function(err, data) {
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
        //res.render('FormAddProduct',{categorys : result});
        res.render('OrderManagement',{orders : result});
    });
    
    //
}

module.exports.setStatus = (req,res) => {

    var varies = req.body.Varies;
    var status = req.body.Status;

    var paramsOrderID = {
        TableName : "Users",
        IndexName: "VariesIndex",
        KeyConditionExpression: "Varies = :varies",
        ExpressionAttributeValues: {
            ":varies": varies
        }
    }

    const promise = new Promise((resolve, reject) => {
        docClient.query(paramsOrderID, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                /*console.log('im here');
                console.log(data.Items[0]);*/
                return resolve(data.Items[0])
            }
        });
    }).then(result => {
        var params = {
            TableName: "Users",
            Key:{
                "UserID": result.UserID,
                "Varies": result.Varies
            },
            UpdateExpression: "set #st = :status",
            ExpressionAttributeNames:{
                "#st": "Status"
            },
            ExpressionAttributeValues:{
                ":status": status
            },
            ReturnValues:"UPDATED_NEW"
        };
        docClient.update(params, function(err, data) {
            if (err) {
                res.status(404);
            } else {
                res.status(200);
            }
            res.end();
        });
    });
}

module.exports.OrderManagementDetail = (req,res) => {
    var paramsOrderID = {
        TableName : "Users",
        IndexName: "StatusIndex",
        KeyConditionExpression: "#st = :status",
        ExpressionAttributeNames:{
            "#st": "Status"
        },
        ExpressionAttributeValues: {
            ":status": "Waiting"
        }
    }
    const promise = new Promise((resolve, reject) => {
        docClient.query(paramsOrderID, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject();
            } else {
                console.log("Query succeeded.");
                return resolve(data.Items);
            }
        });
    }).then(result => {
        console.log(result);
        //res.render('FormAddProduct',{categorys : result});
        res.render('OrderManagementDetail',{orders : result});
    });
}

function getProductByID(productID) {
    return new Promise((resolve,reject) => {
        var paramsProductID = {
            TableName : "Products",
            IndexName : "ProductIDIndex",
            KeyConditionExpression: "ProductID = :productID",
            ExpressionAttributeValues: {
                ":productID": productID
            }
        };
        
        docClient.query(paramsProductID, function(err, data) {
            if (err) {
                return reject(err);
            } else {
                return resolve(data.Items[0]);
            }
        });
    });
}

function asyncFunction(item) {
    
    return new Promise(async (resolve, reject) => {
        var product = await getProductByID(item.ProductID);
        var name = product.ProductName;

        item.name = name;
        resolve(item);
    });
 }

module.exports.getOrderDetail = (req,res) => {

    var orderID = req.params.orderID;

    console.log(orderID);

    var paramsOrderDetail = {
        TableName : "Orders",
        KeyConditionExpression: "OrderID = :orderID",
        ExpressionAttributeValues: {
            ":orderID": orderID
        }
    };
    
    new Promise((resolve, reject) => {
        docClient.query(paramsOrderDetail, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                return resolve(data.Items);
            }
        });
    }).then(result => {
        let promiseArray = result.map(asyncFunction);

        Promise.all(promiseArray).then(result => {
            console.log(result);
        });
        
    }); 
}
function ReturnListProductQuantity(req,res){
    var params = {
        TableName : "Others",
        KeyConditionExpression : "PrimaryKey = :primarykey",
        ExpressionAttributeValues :{
            ":primarykey" : "Category"
        }
    }
    docClient.query(params,function(err,data){
        if(err) console.log(err);
        else {
            var paramsAllProductByCategory = {
                TableName : "Products",
                KeyConditionExpression: "CategoryName = :categoryName",
                ExpressionAttributeValues: {
                    ":categoryName": data.Items[0].SortKey,
                },
        }
        const promise = new Promise((resolve, reject) => {
            docClient.query(paramsAllProductByCategory, function(err, data) {
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
            var paramsCategories = {
                TableName : "Others",
                ProjectionExpression: "SortKey",
                KeyConditionExpression: "PrimaryKey = :primaryKey",
                ExpressionAttributeValues: {
                    ":primaryKey": "Category"
                }
            };
            docClient.query(paramsCategories, function(err, data) {
                if (err) {
                    console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    reject();
                } else {
                    console.log("Query succeeded.");
                    res.render('ProductQuantityManagement',{products : result,categorys : data.Items});
                }
            });
           
        });
        }
    });
}
module.exports.ProductQuantityManagement = (req,res) => {
    ReturnListProductQuantity(req,res);
}
module.exports.ListProductQuantityAdmin = (req,res)=>{
    var paramsAllProductByCategory = {
        TableName : "Products",
        KeyConditionExpression: "CategoryName = :categoryName",
        ExpressionAttributeValues: {
            ":categoryName": req.params.category,
        },
    }
    const promise = new Promise((resolve, reject) => {
        docClient.query(paramsAllProductByCategory, function(err, data) {
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
        res.render('ListProductQuantityAdmin',{products : result});      
        });
}
module.exports.UpdateQuantity = (req,res) => {
    console.log(req);
    var params = {
                TableName: "Products",
                Key:{
                     "CategoryName": req.body.CategoryName,
                     "ProductID": req.body.ProductID
                 },
                 UpdateExpression: "set Quantity = :q",
                 ExpressionAttributeValues:{
                     ":q" : req.body.Quantity              
                 },
                 ReturnValues:"UPDATED_NEW"
             };
             docClient.update(params,function(err,data){
                 if(err) console.log(err);
                else {
                     res.end(JSON.stringify(200));
                 }
             })
    // let form = new formidable.IncomingForm();
    // form.parse(req, function(err, fields, files){
    //    if(err) console.log(err)
    //    else {
    //        console.log(fields.CategoryName);
    //        console.log(fields.Quantity);
    //     var params = {
    //         TableName: "Products",
    //         Key:{
    //             "CategoryName": fields.CategoryName,
    //             "ProductID": fields.ProductID
    //         },
    //         UpdateExpression: "set Quantity = :q",
    //         ExpressionAttributeValues:{
    //             ":q" : fields.Quantity              
    //         },
    //         ReturnValues:"UPDATED_NEW"
    //     };
    //     docClient.update(params,function(err,data){
    //         if(err) console.log(err);
    //         else {
    //             res.end(JSON.stringify({status : 200}));
    //         }
    //     })
    //    }
    // });
}