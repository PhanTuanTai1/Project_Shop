var express = require('express');
var linq = require('async-linq');
var adminController = require('../controllers/admin.controllers');
//Thêm 28-10-2019
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var router = express.Router();
var analyzeController = require('../controllers/analyze.controllers');

router.get('/', function (req, res) {
    res.render('admin', {page: ""});
});
router.get('/CategoryManagement', function (req, res) {
    adminController.CategoryManagement(res);
});
router.post('/AddCategory', function (req, res) {
    adminController.AddCategory(req, res);
});
router.get('/ProductManagement/:category', function (req, res) {
    adminController.ProductManagement(req, res);
});
router.get('/ProductManagement/', function (req, res) {
    adminController.ProductManagement(req, res);
});
router.get('/ListProductAdmin/:category', function (req, res) {
    adminController.ListProductAdmin(req, res);
});
router.get('/AddProduct', function (req, res) {
    adminController.ReturnFormAdd(res);
});
router.post('/AddProduct', function (req, res) {
    adminController.AddProduct(req, res);
});
router.get("/EditProduct/:pid", function (req, res) {
    adminController.ReturnFormEdit(req, res);
})
router.post("/EditProduct", function (req, res) {
    adminController.EditProduct(req, res);
})
router.post("/DeleteProduct/:pid", function (req, res) {
    adminController.DeleteProduct(req, res);
})

router.get('/OrderManagement', jsonParser, function (req, res) {
    adminController.OrderManagement(req, res);
});

router.get('/OrderManagementDetail', jsonParser, function (req, res) {
    adminController.OrderManagementDetail(req, res);
});

router.post('/setStatus', jsonParser, function (req, res) {
    adminController.setStatus(req, res);
});

router.get('/getOrderDetail/:orderID', function (req, res) {
    adminController.getOrderDetail(req, res);
});

router.get('/AnalyzeManagement', jsonParser, async function (req, res) {
    var lsUser = await analyzeController.getAllUser();
    var lsOrder = await analyzeController.getAllOrder();
    var lsOrderDetail = await analyzeController.getAllOrderDetail();
    var lsAnalyze = [];
    //console.log(JSON.stringify(lsAnalyze, null, '\t'));
    //For 1 tìm các order thuộc user này
    for (var a = 0;a<lsUser.length;a++){
        lsAnalyze.push({"UserID":lsUser[a].UserID,"Name":lsUser[a].FirstName + " " + lsUser[a].LastName});
        var lsOrderOfUser = linq(lsOrder).where(function (v) { if(lsUser[a].UserID==v.UserID) return v; }).run();
        lsAnalyze[a].Order = lsOrderOfUser.length;
        lsAnalyze[a].Product = 0;
        lsAnalyze[a].Price = 0;
        //For 2 tìm các OderDetail thuộc Order
        for (var b = 0;b<lsOrderOfUser.length;b++){
            var lsOderDetailOfUser = linq(lsOrderDetail).where(function (v) { if(lsOrderOfUser[b].Varies==v.OrderID) return v; }).run();
            lsOderDetailOfUser.forEach(function (item) {
                lsAnalyze[a].Product += item.Quantity;
                lsAnalyze[a].Price += item.Price*item.Quantity;
            })
        }
    }
    console.log(JSON.stringify(lsAnalyze, null, '\t'));
    res.render('AnalyzeManagement', {page: "",ls : lsAnalyze});
});

router.post('/AnalyzeManagement', jsonParser, function (req, res) {
    res.render('AnalyzeManagement', {page: ""});
});
router.get('/ListProductQuantity/',function(req,res){
    adminController.ProductQuantityManagement(req,res);
});
router.get('/ListProductQuantityAdmin/:category',function(req,res){
    adminController.ListProductQuantityAdmin(req,res);
})
router.post("/EditProductQuantity",function(req,res){
    adminController.UpdateQuantity(req,res);
})
module.exports = router;