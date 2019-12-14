var express = require('express');

var controller = require('../controllers/auth.controllers');

var router = express.Router();

router.get('/login',controller.login);
router.post('/login',controller.loginPost);

module.exports = router;