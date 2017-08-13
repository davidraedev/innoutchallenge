
if ( ! process.env.NODE_ENV )
	throw new Error( "NODE_ENV not defined" );
if ( ! process.env.ENV_PATH )
	throw new Error( "ENV_PATH not defined" );

require( "dotenv" ).config( process.env.ENV_PATH );

const apps = {
	http_server: {
		main: "app/http/server_daemon.js",
		name: "http_server",
		pidfile: "pids/http_server.pid",
	},
	fetch_tweets: {
		main: "app/twitter/tweet_search_daemon.js",
		name: "fetch_tweets",
		pidfile: "pids/fetch_tweets.pid",
	},
	tweet_queue: {
		main: "app/tweet_queue/tweet_queue_daemon.js",
		name: "tweet_queue",
		pidfile: "pids/tweet_queue.pid",
	}
};

function printStatus( name ) {
	let pid = apps[ name ].daemon.status();
	let status = ( pid ) ? "Running ["+ pid +"]" : "Not Running";
	console.log( status );
}

function createOrStartDaemon( name ) {
	if ( apps[ name ].daemon )
		apps[ name ].daemon.start();
	else
		apps[ name ].daemon = require( "daemonize2" ).setup( apps[ name ] );
}

function start( name ) {
	createOrStartDaemon( name );
}

function status( name ) {
	printStatus( name );
}

function stop( name ) {
	apps[ name ].daemon.stop();
}

function start_all() {
	apps.forEach( ( app ) => {
		createOrStartDaemon( app.name );
	});
}

function status_all() {
	apps.forEach( ( app ) => {
		printStatus( app.name );
	});
}

function stop_all() {
	apps.forEach( ( app ) => {
		stop( app.name );
	});
}

function isValidApp( name ) {
	return /^(http_server|fetch_tweets|tweet_queue)$/.test( name );
}

function init( action, name ) {

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
		console.log( "Usage: [start|status|stop|start_all|status_all|stop_all] [http_server|fetch_tweets|tweet_queue]" );
}

init( process.argv[2], process.argv[3] );
