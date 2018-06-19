
var express = require('express');
var app = express();
var bodyparser =  require('body-parser');
var mongoose = require('mongoose');
var ip = require("ip");
var config = require('./database');
mongoose.connect(config.db).then((res) => {
    console.log("server started");
});
console.log(__dirname);
app.use(express.static('./uploads/'));// you can access image 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use('/uploads',express.static(__dirname + '/uploads/'));

var a = ip.address();
console.log(a);
require('./routes')(app);
app.listen(process.env.PORT || 8082);