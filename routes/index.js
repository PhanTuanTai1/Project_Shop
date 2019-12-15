var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");
var shortid = require('shortid');

var queryOthers = require('../controllers/queryOthers.controllers');
var authMiddleware = require('../middleware/auth.middleware');
var cartController = require('../controllers/cart.controllers');
var shopController = require('../controllers/shop.controllers');
var searchController = require('../controllers/search.controllers');
//Việt add>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
var checkoutController = require('../controllers/checkout.controllers');
var productController = require('../controllers/product.controllers');
var orderController = require('../controllers/OrderControl.Controller');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
//Việt add>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/* GET home page. */
router.get('/', async function (req, res, next) {
    queryOthers.Index(req, res);
});


router.get('/shop', function (req, res, next) {
    shopController.getAllCategory(req, res);
});
router.get('/shop/:category', function (req, res, next) {
    shopController.getProductByCategory(req, res);
});
router.get('/Filter', function (req, res, next) {
    shopController.Filter(req, res);
})


router.post('/cart/:id', async function (req, res, next) {

    var userID = req.signedCookies.userID;
    var productID = req.params.id;

    var isValid = await cartController.checkUserIDValid(userID);

    console.log(isValid);

    if (isValid) {
        var orderID = await cartController.getCartID(userID);

        try {
            var t = await cartController.addProductToOrder(orderID, productID);
            t.then(() => {
                res.redirect('/cart');
            });

            res.status(200).send('OK');
        } catch (err) {
            res.status(400).send(err);
        }
    }

    res.status(400).send("Failed");
});


//Việt add>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

router.post('/cart/delete/:id', async function (req, res, next) {

    var userID = req.signedCookies.userID;
    var productID = req.params.id;

    var isValid = await cartController.checkUserIDValid(userID);

    console.log(isValid);

    if (isValid) {
        //res.render('cart', { selected: 3 });

        var orderID = await cartController.getCartID(userID);
        console.log(orderID, productID);
        try {
            var t = await cartController.deleteOrderDetail(orderID, productID);
            res.status(200).send('OK')
        } catch (err) {
            res.status(400).send(err);
        }
    } else {
        res.status(400).send("Failed");
    }

});

router.post('/cart/All/:id', async function (req, res, next) {

    var userID = req.signedCookies.userID;
    var productID = req.params.id.split('|')[0];
    var count = parseInt(req.params.id.split('|')[1]);
    console.log(req.params + "======================================");

    var isValid = await cartController.checkUserIDValid(userID);

    console.log(isValid);

    if (isValid) {
        //res.render('cart', { selected: 3 });
        console.log("Find order");
        var orderID = await cartController.getCartID(userID);
        console.log("Find order success = " + orderID);

        try {
            await cartController.addProductToOrder(orderID, productID, count);

            res.status(200).send('OK');
        } catch (err) {
            res.status(400).send(err);
        }
    } else {
        res.status(400).send("Failed");
    }
});


//http://localhost:3000/checkout?id=123456
router.get('/checkout', authMiddleware.requiredAuth, async function (req, res, next) {
    var userID = req.signedCookies.userID;
    //  console.log(cart);

    var isValid = await cartController.checkUserIDValid(userID);

    if (isValid) {
        var customer = await checkoutController.getUser(userID);
        var orderID = await cartController.getCartID(userID);
        console.log(orderID)
        var cart = await cartController.getOrderDetailByOrderID(orderID);
        let total = 0;
        for (var a = 0; a < cart.length; a++) {
            let price = await cartController.getPriceProductByID(cart[a].ProductID);
            total += price * cart[a].Quantity;
            if (a == cart.length - 1) {
                res.render('checkout', { cus: customer, total: total, selected: 4 });
            }
        }
    } else
        res.end("Error");
});

router.post('/checkout', jsonParser, async function (req, res) {
    var info = req.body;
    var today = new Date();
    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    console.log(req.body);
    var userID = req.signedCookies.userID;
    var isValid = await cartController.checkUserIDValid(userID);
    if (isValid) {
        var varies = await cartController.getCartID(userID);
        var name = await cartController.getProductName(varies);
        console.log(info.TotalPrice);
        res.redirect('OrderControl');
        var t = await checkoutController.completeOrder(userID, varies, name, info.TotalPrice, {
            "FirstName": info.FirstName,
            "LaseName": info.LaseName,
            "Address": info.Address,
            "Phone": info.Phone,
            "DeliveryDate": date,
            "PaymentMethod": info.PaymentMethod
        });
        if (t)
            res.redirect('OrderControl');
        else
            res.end("Error");
    } else {
        res.end("Error");
    }
})

router.get('/register', jsonParser, function (req, res) {
    res.render('register', { selected: 2 });
})

router.post('/register', jsonParser, function (req, res) {
    queryOthers.RegisterUser(req, res);
})

router.get('/product', async function (req, res, next) {
    var id = req.query.id;
    var p = await productController.getProductByID(id);
    res.render('product', { p: p, selected: 2 });
});


router.get('/cart', async function (req, res) {
    var total = 0;
    var cart = {};
    if (req.signedCookies.userID != null) {
        var userID = req.signedCookies.userID;

        var isValid = await cartController.checkUserIDValid(userID);
        if (isValid) {
            var cartId = await cartController.getCartID(userID);
            cart = await cartController.getOrderDetailByOrderID(cartId);
            if (cart.length == 0) {
                res.render('cart', { c: [], total: 0, selected: 2 })
            } else {
                for (var i = 0; i < cart.length; i++) {
                    let p = await cartController.getProduct(cart[i].ProductID);
                    cart[i].ProductName = p.ProductName;
                    total += cart[i].Price * cart[i].Quantity;
                    if (i == cart.length - 1) {
                        res.render('cart', { c: cart, total: total, selected: 2 })
                    }
                }
            }
        } else
            res.render('cart', { c: [], total: 0, selected: 2 });
    } else {
        try {
            cart = JSON.parse(req.cookies.cart);
        } catch (e) {
            res.render('cart', { c: [], total: 0, selected: 2 });
        }
        if (cart.length == 0)
            res.render('cart', { c: [], total: 0, selected: 2 });
        else {
            let ls = [];
            for (var i = 0; i < cart.length; i++) {
                let price = await cartController.getPriceProductByID(cart[i].ProductID);
                cart[i].Price = price;
                console.log("Price.................................." + cart[i].price + price);
                let p = await cartController.getProduct(cart[i].ProductID);
                cart[i].ProductName = p.ProductName;
                total += price * cart[i].Quantity;

                if (i == cart.length - 1) {

                    res.render('cart', { c: cart, total: total, selected: 2 });
                }

            }
        }
    }
});

router.get('/OrderControl', authMiddleware.requiredAuth, async (req, res) => {
    var userID = req.signedCookies.userID;
    console.log(userID);
    var ls = await orderController.getAllOrder(userID);
    for (var i = 0; i < ls.length; i++) {
        var cart = await cartController.getOrderDetailByOrderID(ls[i].Varies);
        console.log(JSON.stringify(cart, null, '\t'));
        let total = 0;
        for (var a = 0; a < cart.length; a++) {
            let price = await cartController.getPriceProductByID(cart[a].ProductID);
            total += price * cart[a].Quantity;
            if (a == cart.length - 1) {
                ls[i].TotalPrice = total;
            }
        }
        if (i == ls.length - 1) {
            console.log(JSON.stringify(ls, null, '\t'));
            res.render('OrderControl', { order: ls, selected: 3 });
        }
    }
});

router.get('/OrderDetail', async (req, res) => {
    var userID = req.signedCookies.userID;
    var orderId = req.query.id;
    var order = await orderController.getOrder(userID, orderId);
    console.log(JSON.stringify(order));
    var cart = await cartController.getOrderDetailByOrderID(orderId);
    let total = 0;
    for (var i = 0; i < cart.length; i++) {
        let price = await cartController.getPriceProductByID(cart[i].ProductID);
        cart[i].Price = price;
        let p = await cartController.getProduct(cart[i].ProductID);
        cart[i].ProductName = p.ProductName;
        total += price * cart[i].Quantity;
        if (i == cart.length - 1)
            res.render('OrderDetail', { order: order, c: cart, total: total, selected: 3 });
    }
});
router.get('/UserInfomation', authMiddleware.requiredAuth, async function (req, res) {
    var userID = req.signedCookies.userID;
    var customer = await checkoutController.getUser(userID);
    res.render('UserInfomation', { cus: customer, selected: 3 });
})

router.post('/UserInfomation', jsonParser, async function (req, res) {
    var info = req.body;
    console.log(info);
    var userID = req.signedCookies.userID;
    var isValid = await cartController.checkUserIDValid(userID);

    if (isValid) {
        var params = {
            TableName: "Users",
            Key: {
                "UserID": userID,
                "Varies": userID,
            },
            UpdateExpression: "set #em=:em,#fin=:fin,#lstn=:lstn,#con=:con,#ad=:ad,#ct=:ct,#zi=:zi,#ph=:ph,#fv=:fv",
            ExpressionAttributeNames: {
                "#em": "Email",
                "#fin": "FirstName",
                "#lstn": "LastName",
                "#con": "Country",
                "#ad": "Address",
                "#ct": "City",
                "#zi": "ZipCode",
                "#ph": "Phone",
                "#fv": "Favorite"
            },
            ExpressionAttributeValues: {
                ":em": info.email,
                ":fin": info.FirstName,
                ":lstn": info.LastName,
                ":con": info.country,
                ":ad": info.Address,
                ":ct": info.City,
                ":zi": info.ZipCode,
                ":ph": info.Phone,
                ":fv": []
            },
            ReturnValues: "UPDATED_NEW"
        };

        docClient.update(params, function (err, data) {
            if (err) {
                console.log(JSON.stringify(err));
            } else {
                console.log("Update ok");
                res.redirect('UserInfomation');
            }
        });
    }

})

router.get('/search/:searchString', (req, res) => {
    searchController.search(req, res);
});

router.get('/cregister',(req,res) => {
    res.render('register',{
        error: ''
    });
})

router.post('/cregister',(req,res) => {
    
    console.log(req.body.password + ' | ' + req.body.repassword);

    if(req.body.password !== req.body.repassword){
        res.render('register',{
            error: 'Passsword and confirm password must be the same'
        });
    }

    var paramsEmail = {
        TableName : "Users",
        IndexName: "EmailIndex",
        KeyConditionExpression: "Email = :email",
        ExpressionAttributeValues: {
            ":email": req.body.email
        }
    };

    docClient.query(paramsEmail,(err,data) => {
        if(err)
            res.render('register',{
                error: "Cannot connect to serrver"
            });
        else {
            if(data.Items.length > 0) 
                res.render('register',{
                    error: "Email used please choose another one"
                });
            else {
                var userid = shortid.generate();

                var params = {
                    TableName:"Users",
                    Item:{
                        "UserID": userid,
                        "Varies": userid,
                        "Email": req.body.email,
                        "Password" : req.body.password
                    }
                };
                docClient.put(params,(err,data) => {
                    if (err) {
                        res.render('register',{
                            error: "Email or password invalid"
                        });
                    } else {
                        res.render('register',{
                            error: "Created account"
                        })
                    }
                })
            }
        }
    })

})
module.exports = router;