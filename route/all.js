var express = require( "express" );
var router = express.Router();
var bodyParser = require( "body-parser" );

var view_controller = require( "../controller/view" );
var user_controller = require( "../controller/user" );
var store_controller = require( "../controller/store" );

var urlEncodedParser = bodyParser.urlencoded({ extended: false })
var jsonParser = bodyParser.json()


// Views
router.get( "/", view_controller.splash );

// User
router.post( "/api/users/list", jsonParser, user_controller.users_list );

// Store
router.get( "/stores", store_controller.store_list );
router.get( "/store/:id", store_controller.store_info );
router.get( "/store/refresh", store_controller.store_refresh );

module.exports = router;