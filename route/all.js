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
router.post( "/api/user/receipts", jsonParser, user_controller.user_instore_receipts );
router.post( "/api/user/stores", jsonParser, user_controller.user_stores );
router.post( "/api/user/drivethru", jsonParser, user_controller.user_drivethru_receipts );

// Store
router.get( "/stores", store_controller.store_list );
router.get( "/store/:id", store_controller.store_info );
router.get( "/store/refresh", store_controller.store_refresh );

module.exports = router;