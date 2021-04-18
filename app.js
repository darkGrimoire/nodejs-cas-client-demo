var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const fs = require('fs');
var cas = require('connect-cas');
const https = require('https');
const { createProxyMiddleware } = require('http-proxy-middleware');

const key = fs.readFileSync('./key.pem');

const cert = fs.readFileSync('./cert.pem');

cas.configure({ 'host': 'login.itb.ac.id', 'protocol': 'https',
paths: {
        validate: '/validate',
        serviceValidate: '/cas/p3/serviceValidate', // CAS 3.0
        proxyValidate: '/p3/proxyValidate', // CAS 3.0
        proxy: '/cas_proxy',
        login: '/cas/login',
        logout: '/logout'
    }
});

var routes = require('./routes/default');

var app = express();
app.use('/.*', createProxyMiddleware({ target: 'https://localhost.itb.ac.id/', changeOrigin: true }));
// app.use('/cas_proxy', createProxyMiddleware({ target: 'https://login.itb.ac.id/', changeOrigin: true, pathRewrite: {'^/cas_proxy': '/'} }));
const server = https.createServer({key: key, cert: cert }, app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'nodejs-cas-client-demo'}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = server;
