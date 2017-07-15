var express = require( "express" );
var router = express.Router()
var controller = require( "../controller/auth" );

router.get( "/login", controller.user_login );
router.get( "/auth/twitter", controller.user_login_2 );
router.get( "/auth/twitter/callback", controller.user_login_3 );

router.get( "/admin/login", controller.admin_login );
router.get( "/admin/auth/twitter", controller.admin_login_2 );
router.get( "/admin/auth/twitter/callback", controller.admin_login_3 );


module.exports = router;