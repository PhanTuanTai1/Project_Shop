var AWS = require("aws-sdk");

var cartController = require('../controllers/cart.controllers');

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.Merge =  async (localData, userID) => {

    var orderID = await cartController.getCartID(userID);

    var productsLocal = JSON.parse(localData);

    if(productsLocal.length <= 0) {
        return false;
    }

    productsLocal.forEach(async product => await cartController.addProductToOrder(
        orderID,
        product.ProductID,
        product.Quantity
    ));

    return true;
}

