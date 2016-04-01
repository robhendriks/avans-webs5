var path = require('path');
var express = require('express');
var handlebars = require('express-handlebars');
var session = require('express-session');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');

var dbConfig = require('./config/db');
require('mongoose').connect(dbConfig.url);

var app = express();

app.engine('hbs', handlebars({ extname: 'hbs', defaultLayout: 'main' }));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('topkek'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ resave: false, saveUninitialized: true, secret: 'topkek' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
  
require('./modules/localAuth')(app, passport);
require('./modules/socialAuth')(app, passport);

app.use('/', require('./routes'))
app.use('/auth', require('./routes/auth'));

module.exports = app;
