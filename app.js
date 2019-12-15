var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var authMiddleware = require('./middleware/auth.middleware');
var adminRouter = require('./routes/admin');

var searchController = require('./controllers/search.controllers');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("312F6233F0FD7205CCA1432153399BA0"));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users',authMiddleware.requiredAuth, usersRouter);
app.use('/auth', authRouter);
app.use('/admin',authMiddleware.requiredAdminAuth,adminRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
