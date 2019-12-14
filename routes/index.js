var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");

var queryOthers = require('../controllers/queryOthers.controllers');
var authMiddleware = require('../middleware/auth.middleware');
var cartController = require('../controllers/cart.controllers');
var shopController = require('../controllers/shop.controllers');

//Việt add>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
var checkoutController = require('../controllers/checkout.controllers');
var productController = require('../controllers/product.controllers');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
//Việt add>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

/* GET home page. */
router.get('/', function (req, res, next) {
    queryOthers.Index(res);
});


router.get('/shop', function (req, res, next) {
    shopController.getAllCategory(res);
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
    }
    else {
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
        var totalPrice = await checkoutController.getOrderTotalPrice(orderID)

        res.render('checkout', {cus: customer, total: totalPrice, selected: 4});
    } else
        res.end("Error");
});

router.post('/checkout', jsonParser, async function (req, res) {
    var info = req.body;
    var today = new Date();
    var date = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear();
    console.log(req.body);
    var userID = req.signedCookies.userID;
    var isValid = await cartController.checkUserIDValid(userID);
    if (isValid) {
        var varies = await cartController.getCartID(userID);
        var name = await cartController.getProductName(varies);
        res.redirect('/');
        var t = await checkoutController.completeOrder(userID, varies,name,info.TotalPrice,{
            "FirstName" : info.FirstName,
            "LaseName" : info.LaseName,
            "Address" : info.Address,
            "Phone" : info.Phone,
            "DeliveryDate" : date,
            "PaymentMethod": info.PaymentMethod
        });
        if (t)
            res.redirect('/');
        else
            res.end("Error");
    } else {
        res.end("Error");
    }
})

router.get('/register', jsonParser, function (req, res) {
    res.render('register', {selected: 2});
})

router.post('/register', jsonParser, function (req, res) {
    queryOthers.RegisterUser(req, res);
})

router.get('/product', async function (req, res, next) {
    var id = req.query.id;
    var p = await productController.getProductByID(id);

    res.render('product', {p: p, selected: 2});
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
                res.render('cart', {c: [], total: 0, selected: 3})
            } else {
                for (var i = 0; i < cart.length; i++) {
                    let p = await cartController.getProduct(cart[i].ProductID);
                    cart[i].ProductName = p.ProductName;
                    total += cart[i].Price * cart[i].Quantity;
                    if (i == cart.length - 1) {
                        res.render('cart', {c: cart, total: total, selected: 3})
                    }
                }
            }
        } else
            res.render('cart', {c: [], total: 0, selected: 3});
    } else {
        try {
            cart = JSON.parse(req.cookies.cart);
        } catch (e) {
            res.render('cart', {c: [], total: 0, selected: 3});
        }
        if (cart.length == 0)
            res.render('cart', {c: [], total: 0, selected: 3});
        else {
            for (var i = 0; i < cart.length; i++) {
                let price = await cartController.getPriceProductByID(cart[i].ProductID);
                cart[i].Price = price;
                total += price * cart[i].Quantity;
                if (i == cart.length - 1)
                    res.render('cart', {c: cart, total: total, selected: 3});
            }
        }
    }
});

module.exports = router;