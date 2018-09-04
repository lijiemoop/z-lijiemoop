const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const debug = require('debug')('JM:server');
const http = require('http');
const config = require('./config.json');
const pubFn = require('./lib/publicFn');
require('colors');
//数据库
const DB = require('./db/index.js');
let db;

const redis =	require("redis");
const session = require('express-session');
const redisStore = require('connect-redis')(session);

const client = redis.createClient(config['redis']['port'],config['redis']['url']);
client.on("error", function (err) {
    console.log(('[REDIS ERROR]['+ pubFn.getTime('-', ':') + ']').red + 'redis连接出错：');
    console.log("错误信息：" + err);
});

const page = require('./routes/page/router');
const user = require('./routes/user/router');
const pub = require('./routes/public/router');

db = new DB(function(db){
    const app = express();

// view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


    app.use(function(req,res,next){
        req.db = db;
        next();
    });

    app.use( session({
        secret: config['redis']['secret'],
        store: new  redisStore({
            client: client,
            //prefix: Config[env]['redis']['prefix'],
            ttl : 26000}),
        saveUninitialized: false,
        resave: false
    }));

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));


    app.use('/user', user);
    app.use('/pub', pub);

    app.use(function(req,res,next){
        const deviceAgent = req.headers['user-agent'].toLowerCase();
        const agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
        if(agentID){
            req.deviceType = 'mobile';
        }else{
            req.deviceType = 'PC';
        }
        next();
    });

    app.use('/', page);

// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        const err = new Error('Not Found');
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

    /**
     * Get port from environment and store in Express.
     */

    const port = normalizePort(process.env.PORT || config.appPort);
    app.set('port', port);

    /**
     * Create HTTP server.
     */

    const server = http.createServer(app);
    console.log(('[SUCCESS]['+ pubFn.getTime('-', ':') + ']服务已启动，端口：'+ port).green);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
        const port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.log(('[ERROR]['+ pubFn.getTime('-', ':') + ']').red + '没有端口权限');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.log(('[ERROR]['+ pubFn.getTime('-', ':') + ']').red + '端口已被占用');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
});