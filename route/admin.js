var express = require( "express" );
var router = express.Router()
var controller = require( "../controller/admin" );

router.get( "/admin/send_tweet", controller.send_tweet );

module.exports = router;