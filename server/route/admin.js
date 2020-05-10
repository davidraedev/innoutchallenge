var express = require( "express" );
var router = express.Router()
var controller = require( "../controller/admin" );

router.get( "/api/admin/user/send_tweet", () => {
	//controller.newUserTweetTest( "daraeman" );
});

module.exports = router;