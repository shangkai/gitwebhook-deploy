var http = require('http');
var createHandler = require('github-webhook-handler');
var secret = process.env.SECRET || 'myHashSecret';
var urlpath = process.env.URLPATH || '/incoming';
var handler = createHandler({path: urlpath, secret: secret});
var debug = require("debug")("gitwebhook-deploy:deploy.js");
// 上面的 secret 保持和 GitHub 后台设置的一致

var deploysh = process.env.DEPLOYSH || './deploy.sh';
var port = normalizePort(process.env.PORT || '7777');

var server = http.createServer(function (req, res) {
    handler(req, res, function (err) {
        debug('A 404 access.');
        res.statusCode = 404;
        res.end('no such location');
    })
});
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


handler.on('error', function (err) {
    debug('Error:', err.message);
});

handler.on('push', function (event) {
    debug('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
    run_deploy();
});

/*
 handler.on('issues', function (event) {
 console.log('Received an issue event for % action=%s: #%d %s',
 event.payload.repository.name,
 event.payload.action,
 event.payload.issue.number,
 event.payload.issue.title)
 })
 */

function run_deploy(){
    run_cmd(deploysh, function (text) {
        debug(text);
    });
}


function run_cmd(cmd, callback) {
    var exec = require('child_process').exec;
    exec(cmd, function(err, stdout, stderr) {
        if(err){
            callback('run_cmd err:'+err);
        } else if(stdout){
            callback('run_cmd stdout:'+stdout);
        } else {
            callback('run_cmd stderr:'+stderr);
        }
    });
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

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

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
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
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
