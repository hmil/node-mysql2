var createConnection = require('../common.js').createConnection;
var assert = require('assert');
var through2 = require('through2');

// enabled in initial config, disable in some tets
var c = createConnection({ rowsAsArray: true });
var binlogStream = c.createBinlogStream({
    serverId: 123, // slave ID, first field in "show slave hosts" sql response
    // you can also specify slave host, username, password and port
    masterId: 0,
    filename: 'mysql-bin.000004',
    binlogPos: 116971,
    flags: 1 // 1 = "non-blocking mode"
});

binlogStream.pipe(
    through2.obj(function(obj, enc, next) {
        console.log(obj);
        next();
    })
);
c.query(
[
    'CREATE TEMPORARY TABLE `insert_test` (',
    '`id` int(11) unsigned NOT NULL AUTO_INCREMENT,',
    '`title` varchar(255),',
    'PRIMARY KEY (`id`)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8'
].join('\n')
);

c.query('INSERT INTO insert_test SET title="hello"', function(
    err,
    _result
) {
    if (err) {
        throw err;
    }
    result = _result;
    c.query(
        'SELECT * FROM insert_test WHERE id = ' + result.insertId,
        function(err, _result2) {
            if (err) {
                throw err;
            }
            result2 = _result2;
            c.end();
        }
    );
});
