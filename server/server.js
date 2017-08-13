if ( ! process.env.NODE_ENV )
	throw new Error( "NODE_ENV not defined" );
if ( ! process.env.ENV_PATH )
	throw new Error( "ENV_PATH not defined" );

require( "dotenv" ).config( { path: process.env.ENV_PATH } );

const base = process.cwd();
process.env.BASE = base;

console.log( base + "/server/app/http/server_daemon.js" );

let apps = {
	http_server: {
		main: base + "/server/app/http/server_daemon.js",
		name: "http_server",
		pidfile: base + "/pids/http_server.pid",
	},
	fetch_tweets: {
		main: base + "/server/app/twitter/tweet_search_daemon.js",
		name: "fetch_tweets",
		pidfile: base + "/pids/fetch_tweets.pid",
	},
	tweet_queue: {
		main: base + "/server/app/tweet_queue/tweet_queue_daemon.js",
		name: "tweet_queue",
		pidfile: base + "/pids/tweet_queue.pid",
	},
	fetch_stores: {
		main: base + "/server/app/store/update_stores_daemon.js",
		name: "fetch_stores",
		pidfile: base + "/pids/fetch_stores.pid",
	},
	update_twitter_users: {
		main: base + "/server/app/twitter_user/update_twitter_users_daemon.js",
		name: "update_twitter_users",
		pidfile: base + "/pids/update_twitter_users.pid",
	}
};

Object.keys( apps ).forEach( ( name ) => {
	apps[ name ].daemon = require( "daemonize2" ).setup( apps[ name ] );
});

function printStatus( name ) {
	let pid = apps[ name ].daemon.status();
	let status = ( pid ) ? "Running ["+ pid +"]" : "Not Running";
	console.log( "Status of", name, status );
}

function start( name ) {
	apps[ name ].daemon.start();
	printStatus( name );
}

function status( name ) {
	printStatus( name );
}

function stop( name ) {
	apps[ name ].daemon.stop();
}

function start_all() {
	Object.keys( apps ).forEach( ( name ) => {
		start( name );
	});
}

function status_all() {
	Object.keys( apps ).forEach( ( name ) => {
		printStatus( name );
	});
}

function stop_all() {
	Object.keys( apps ).forEach( ( name ) => {
		stop( name );
	});
}

const app_string = Object.keys( apps ).join( "|" );
const regex = new RegExp( "^("+ app_string +")$" );

function isValidApp( name ) {
	return regex.test( name );
}

function init( action, name ) {
	console.log( "[%s] [%s]", action, name )

	if ( action === "start_all" )
		start_all();
	else if ( action === "status_all" )
		status_all();
	else if ( action === "stop_all" )
		stop_all();
	else if ( action === "start" && isValidApp( name ) )
		start( name );
	else if ( action === "status" && isValidApp( name ) )
		status( name );
	else if ( action === "stop" && isValidApp( name ) )
		stop( name );
	else
		console.log( "Usage: [start|status|stop|start_all|status_all|stop_all] ["+ app_string +"]" );
}

init( process.argv[2], process.argv[3] );
