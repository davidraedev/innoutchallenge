var express = require( "express" );
var router = express.Router();

router.get( "/", function( request, response ){
	response.send( "Hello World!" );
});

router.get( "/test", function( request, response ){
	response.send( "Test World!" );
});

module.exports = router;