// server.js

// BASE SETUP
// =============================================================================

// Setup the packages that we need
var express    = require('express');        // call express
var exphbs     = require('express-handlebars');
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var url        = require('url');
var http	   = require('http');
var querystring =require('querystring');

// Hardcoded stuff
var clientId = 'A22d2fg224h98k8D7HH21';
var authServer = 'http://pi-auth-server.herokuapp.com';
var clientServer = 'http://pi-client-server.herokuapp.com'; // debug: 'http://localhost:8080';
var redirectUrl = clientServer + '/authresponse';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/images', express.static(__dirname + "/images"));

var port = process.env.PORT || 8080;        // set our port

// Global variables
var token = "";

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
	var reqUrl = authServer + '/request-token?authCode='+authCode;
	console.log(reqUrl);
	
	http.get(reqUrl, function(response) {
	  console.log("Got response: " + response.statusCode);
	  if(response.statusCode === 200){
	  	response.on('data',function(chunk) {
	  		console.log('response' + chunk);
		  	token = JSON.parse(chunk).token;
		  	console.log(token);
		  	res.render('authresponse', {
		  		token: token
		  	});		

		});
	  }
	  
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	  res.render('authresponse');
	});
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);