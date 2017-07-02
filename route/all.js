var express = require( "express" );
var router = express.Router();

var view_controller = require( "../controller/view" );
var user_controller = require( "../controller/user" );
var store_controller = require( "../controller/store" );

// Views
router.get( "/", view_controller.splash );

// User
router.get( "/users", user_controller.user_list );
router.get( "/user/:id", user_controller.user_info );
router.get( "/user/create", user_controller.user_create_get );
router.post( "/user/create", user_controller.user_create_post );
router.get( "/user/:id/update", user_controller.user_update_get );
router.post( "/user/:id/update", user_controller.user_update_post );
router.get( "/user/:id/delete", user_controller.user_delete_get );
router.post( "/user/:id/delete", user_controller.user_delete_post );

// Store
router.get( "/stores", store_controller.store_list );
router.get( "/store/:id", store_controller.store_info );
router.get( "/store/refresh", store_controller.store_refresh );

module.exports = router;