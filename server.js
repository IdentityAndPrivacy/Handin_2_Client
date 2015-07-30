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
var https	   = require('https');
var querystring =require('querystring');

// Hardcoded stuff
var clientId = 'A22d2fg224h98k8D7HH21';
var authServer = 'https://pi-auth-server.herokuapp.com';
var clientServer = 'https://pi-client-server.herokuapp.com'; // debug: 'http://localhost:8080'; //
var resourceServer = 'https://pi-resource-server.herokuapp.com';
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
	// Waking up the other servers (they are free :) )
	https.get(authServer, function(response){});
	https.get(resourceServer, function(response){});
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
	
	https.get(reqUrl, function(response) {
		console.log("Got response: " + response.statusCode);
		if(response.statusCode === 200){
			response.on('data',function(chunk) {
				console.log('response' + chunk);
				token = JSON.parse(chunk).token;
				console.log(token);

			  	// Information about "me"
			  	https.get('https://pi-auth-server.herokuapp.com/me?token='+token, function(meResponse) {
			  		if (meResponse.statusCode === 200) {
			  			meResponse.on('data',function(chunk) {
			  				console.log(chunk);
			  				var user = JSON.parse(chunk).user;
			  				console.log('User' + user);
			  				getFriends(token, user, res);
			  			});
			  		}
			  	});
		  });
		}
		else
		{
			res.render('error', {
				error:'(authserver/request-token) ' + response.statusCode
			});
		}

	}).on('error', function(e) {	  
		res.render('error', {
			error: e.message
		});
	});
});

function getFriends(token, user, res) {
	// var post_data = querystring.stringify({
 //      'accessToken': token
 //  	});
 //  	console.log('Data: ' + post_data);

  	// var post_options = {
  	// 	host: 'pi-resource-server.herokuapp.com',
  	// 	path: '/users',
  	// 	method: 'POST',
  	// 	headers: {
  	// 		'Content-Type': 'application/x-www-form-urlencoded',
  	// 		'Content-Length': post_data.length
  	// 	}
  	// };

  	https.get('https://pi-resource-server.herokuapp.com/users?accessToken='+token, function(resourceRes) {
  		console.log('ANSWER!');  		
  		var data = '';
  		resourceRes.on('data', function (chunk) {
  			console.log('bigger chunk');
	        data += chunk;
      	});
      	resourceRes.on('end', function(){
			if (resourceRes.statusCode === 200) {
				console.log('DATA!!!:' + data);
		        if(data && (JSON.parse(data).message !== 'Access denied!')){
	  				// Render page
	  				console.log('Data exists!');
			      	var jsonObject = JSON.parse(data);		      	
			      	// Show view
				    res.render('authresponse', {
				  		token: token,
				  		name: user.firstname + ' ' + user.lastname,
				  		users: jsonObject.data.users
				  	});
	  			}
	  			else{
	  				res.render('error', {
						error: '(resource)'
					});
	  			}
			}
			else{
  				res.render('error', {
					error: '(resource) ' + resourceRes.statusCode
				});
  			}      		
	    });
  	});

    // post_req.write(post_data);
    // post_req.end();

};

// START THE SERVER
// =============================================================================
app.get('*',function(req,res){  
    res.redirect('https://pi-client-server.herokuapp.com'+req.url);
});
app.listen(port);
console.log('Magic happens on port ' + port);