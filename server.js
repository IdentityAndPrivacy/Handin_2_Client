// server.js

// BASE SETUP
// =============================================================================

// Setup the packages that we need
var express    = require('express');        // call express
var exphbs     = require('express-handlebars');
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// Hardcoded stuff
var clientId = 'A22d2fg224h98k8D7HH21';
var authServerPath = 'http://pi-auth-server.herokuapp.com/login';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
// router.get('/', function(req, res) {
//     res.json({ message: 'hooray! welcome to our api!' });   
// });

// Home path
app.get('/', function (req, res) {
    res.render('home');
});

// Redirection to Authentication server's login
router.get('/login', function(req, res) {	
	var url = authServerPath + '?clientId=' + clientId;	
	res.writeHead(302,
	  {Location: url}
	);
	res.end();
});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);