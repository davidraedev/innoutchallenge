var express = require( "express" );
var router = express.Router();

var view_controller = require( "../controller/view" );
var user_controller = require( "../controller/user" );
var store_controller = require( "../controller/store" );

// Views
router.get( "/", user_controller.user_list );

// Users
router.get( "/challengers", user_controller.user_list );
router.get( "/challengers/:username", user_controller.user_info );

// Store
router.get( "/stores", store_controller.store_list );
router.get( "/store/:username", store_controller.store_info );
router.get( "/store/refresh", store_controller.store_refresh );

module.exports = router;