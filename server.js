// server.js

// BASE SETUP
// =============================================================================

// Setup the packages that we need
var express    = require('express');        // call express
var exphbs     = require('express-handlebars');
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var url        = require('url');

// Hardcoded stuff
var clientId = 'A22d2fg224h98k8D7HH21';
var authServer = 'http://pi-auth-server.herokuapp.com';
var clientServer = 'http://pi-client-server.herokuapp.com';
var redirectUrl = clientServer + '/authresponse';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var port = process.env.PORT || 8080;        // set our port


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
// router.get('/', function(req, res) {
//     res.json({ message: 'hooray! welcome to our api!' });   
// });

// Home path
app.get('/', function (req, res) {
    res.render('home');
});

// Redirection to Authentication server's login
app.get('/login', function(req, res) {	
	var url = authServer + '/login?clientId=' + clientId + '&redirectUrl=' + encodeURIComponent(redirectUrl);	
	res.writeHead(302,
	  {Location: url}
	);
	res.end();
});
// Redirect from Authorization server with Auth Code
app.get('/authresponse', function(req, res) {
	// Request token from Authorization server
	var authCode = url.parse(req.url,true).query.authCode;

	// Present
	res.render('authresponse', {authCode: authCode});
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);