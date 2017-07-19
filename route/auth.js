var express = require( "express" );
var router = express.Router()
var authController = require( "../controller/auth" );

//router.get( "/signin", authController.user_login );
//router.get( "/auth/twitter", authController.user_login_2 );
//router.get( "/auth/twitter/callback", authController.user_login_3 );

router.get( "/admin/signin", authController.admin_login );
router.get( "/admin/auth/twitter", authController.admin_login_2 );
router.get( "/admin/auth/twitter/callback", authController.admin_login_3 );

module.exports = router;