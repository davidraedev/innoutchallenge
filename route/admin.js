var express = require( "express" );
var router = express.Router()
var controller = require( "../controller/admin" );

router.get( "/admin/send_tweet", () => {
	//controller.newUserTweetTest( "daraeman" );
});

module.exports = router;