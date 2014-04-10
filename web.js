
'use strict';

var express = require('express');
var logfmt = require('logfmt');
var app = express();

app.use(logfmt.requestLogger());
app.use(express['static'](__dirname + '/dist'));

app.get('/api', function(req, res) {
    res.json({
        _links: [
            {rel: 'users', href: '/api/users/'}
        ]
    });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log('Listening on port %d', port);
});
