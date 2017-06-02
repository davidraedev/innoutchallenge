var Receipt = require( "../model/receipt" );
var Tweet = require( "../model/tweet" );
var User = require( "../model/user" );
//var env = require( "node-env-file" )
var TwitterUser = require( "../model/twitter_user" );
var db = require( "../app/db" );
//env( ".env" );

// could change new user join date to the tweet time

db.connect(function( error ){
	if ( error )
		throw new Error( error );
});

function parseTweet( text ) {
	var has_hashtag = /\#innoutchallenge/i.test( text );
	if ( ! has_hashtag )
		return false;
	else {
		return {
			receipt: 1,
			date: new Date(),
		};
	}
}

function getUser( tweet_object, callback ) {

	TwitterUser.findOne( { "data.id_str": tweet_object.user.id_str }, function( error, twitter_user ){

		if ( error )
			return callback( error );

		if ( ! twitter_user ) {
			console.log( "TwitterUser not found, creating" );
			twitter_user = new TwitterUser({
				data: tweet_object.user,
			});
			twitter_user.save(function( error ){

				if ( error )
					throw new Error( error );

				console.log( "Creating User from TwitterUser" );

				var user = new User({
					join_date: new Date( tweet_object.created_at ),
					twitter_user: twitter_user._id,
				});
				user.save(function( error ){
					if ( error )
						throw new Error( error );
					console.log( "New User created" );
				});

			});
		}
		else {

			console.log( "TwitterUser found" );
			console.log( twitter_user );

			User.findOne( { twitter_user: twitter_user._id }, function( error, user ){

				if ( error )
					return callback( error );

				if ( ! user )
					return callback( "Failed to find User via twitter_user objectid ["+ twitter_user._id +"]" );

				console.log( "User found" );
				console.log( user );
				callback( null, user );

			});
		}

	});
}

// this throws an error in the foreach, instead of dropping ot callback
var get_unparsed_tweets = function( callback ) {

	console.log( "get_unparsed_tweets" );

	Tweet.find( { parsed: false }, function( error, tweets ){

		if ( error )
			callback( error );

		if ( tweets === null ) {
			console.log( "No unparsed Tweets found" );
			callback();
		}

		tweets.forEach(function( tweet ){
			console.log( tweet );
			var text = tweet.toObject().data.text;
			var tweet_object = tweet.toObject().data;
			var parse = parseTweet( text );
			if ( ! parse ) {
				console.log( "Tweet did not contain innoutchallenge [%s]", text );
				tweet.update( { parsed: true }, function( error ){
					if ( error )
						throw new Error( error );
					console.log( "tweet updated, no change" );
				});
			}
			else {
				console.log( "Tweet contains innoutchallenge [%s]", text );
				tweet.update( { parsed: true }, function( error ){
					if ( error )
						throw new Error( error );
					console.log( "tweet updated, has receipt" );
				});
				getUser( tweet_object, function( error, user ){

					if ( error )
						throw new Error( error );

					console.log( user );

					var receipt = new Receipt({
						number: parse.number,
						date: parse.date,
						user: user._id,
					});

					receipt.save(function( error ){
						if ( error )
							throw new Error( error );
						console.log( "New Receipt Created" );
					});
				});
			}
		});

	});
};

function isDisallowedAccount( screen_name ){
	let disallowed = [ "innoutchallenge", "innoutreceipts" ];
	return ( disallowed.indexOf( screen_name ) !== -1 );
}

function isRetweet( tweet ) {
	return ( tweet.retweeted_status );
}

function toNumbers( word ) {
	word = word.toLowerCase();
	word = word.replace( "fourty", "forty" );
	let numbers = {
		'one': '1',
		'two': '2',
		'three': '3',
		'four': '4',
		'five': '5',
		'six': '6',
		'seven': '7',
		'eight': '8',
		'nine': '9',
		'ten': '10',
		'eleven': '11',
		'twelve': '12',
		'thirteen': '13',
		'fourteen': '14',
		'fifteen': '15',
		'sixteen': '16',
		'seventeen': '17',
		'eighteen': '18',
		'nineteen': '19',
		'twenty': '20',
		'thirty': '30',
		'forty': '40',
		'fifty': '50',
		'sixty': '60',
		'seventy': '70',
		'eighty': '80',
		'ninety': '90',
	};
	let tens_numbers = {
		'twenty': '20',
		'thirty': '30',
		'forty': '40',
		'fifty': '50',
		'sixty': '60',
		'seventy': '70',
		'eighty': '80',
		'ninety': '90'
	};

	// match 10 tens that have single digit numbers in it first
	let matches = word.match( /(fourteen|sixteen|seventeen|eighteen|nineteen)/ );
	if ( matches ) {
		if ( tens_numbers[ word ] )
			return tens_numbers[ word ];
	}

	// 20+ tens and their derivatives
	matches = word.match( /((twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety)(-|\s)(one|two|three|four|five|six|seven|eight|nine))/ );
	if ( matches ) {
		let split = word.split( " " );
		
		if ( tens_numbers[ split[0] ] ) {
			let real_number_a = tens_numbers[ split[0] ];

			if ( numbers[ split[1] ] ) {
				let real_number_b = numbers[ split[1] ];
				let real_number_aa = real_number_a[0];
				return real_number_aa + real_number_b;
			}
		}
	}

	if ( numbers[ word ] ) {
		return numbers[ word ];
	}
	
	return false;
}

function parseForInStoreReceipt( text ) {

	text = text.toLowerCase();

	let r = /(((one|two|three|four|five|six|seven|eight|nine) (thousand))|((one|two|three|four|five|six|seven|eight|nine)-(thousand)))/;
	text = text.replace( r, "" );

	// ignore tweets containing hashbang "#!"
	if ( /(?!\/)#\!(?!\/)/.test( text ) )
		return null;

	// parse for digits
	var matches = text.match( /((^| )[\d]{1,2})([\s!.]|$)/ );
	if ( matches && matches[1] && matches[1] >= 1 && matches[1] <= 99 && matches[1] != 69)
		return parseInt( matches[1] );

	r = [
		/((twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety)-(one|two|three|four|five|six|seven|eight|nine))/,
		/((twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety) (one|two|three|four|five|six|seven|eight|nine))/,
		/ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine/,
	];

	// parse for word-numbers
	// take the first match and attempt to convert it into an integer
	for ( let i = 0; i < r.length; i++ ) {
		let matches = text.match( r[i] );
		if ( matches && matches[0] )
			return parseInt( toNumbers( matches[0] ) );
	}

	return null;

}

var parse_tweets_for_receipts = function( callback ) {

	Tweet.find( { parsed: false, flagged: false }, function( error, tweets ){

		if ( error )
			return callback( error );

		if ( ! tweets || ! tweets.length ) {
			console.log( "no tweets found" );
			callback();
		}

		tweets.forEach(function( tweet ){

			let data = tweet.toObject().data;

			tweet.parsed = true;
			tweet.save( function( error ){
				if ( error )
					throw new Error( error );
			});


			if ( isDisallowedAccount( data.user.screen_name ) ) {
				console.log( "Disallowed Account [%s]", data.user.screen_name );
				return;
			}

			if ( isRetweet( tweet.toObject().data ) ) {
				console.log( "Is Retweet" );
				return;
			}

			let receipt_number = parseForInStoreReceipt( data.text );
			if ( receipt_number ) {

				getUser( data, function( error, user ){
					if ( error )
						throw new Error( error );

					let receipt = new Receipt({
						number: receipt_number,
						date: new Date( data.created_at ),
						tweet: tweet._id,
						user: user._id,
						type: "in",
					});

					receipt.save( function( error ){
						if ( error )
							throw new Error( error );
					});
				});
			}
		});

	});

};

module.exports = {
	get_unparsed_tweets: get_unparsed_tweets,
	parse_tweets_for_receipts: parse_tweets_for_receipts,
};