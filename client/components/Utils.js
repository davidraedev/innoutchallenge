const convertProfileImageUrl = function( url, size ) {

	if ( ! url )
		return url;
	
	let regex = /(_normal|200x200|400x400)(\.\w+)/;
	let replace;
	if ( size == "normal" )
		replace = "_normal";
	else if ( size == 200 )
		replace = "_200x200";
	else if ( size == 400 )
		replace = "_400x400";
	else if ( size == "full" )
		replace = "";
	return url.replace( regex, replace + "$2" );
}

const formatCircleNumber = function( number ) {
	if ( number == 69 )
		return "68½";
	return number;
}

const createUserTwitterLink = function( screen_name ) {
	return "https://twitter.com/"+ screen_name.replace( "@", "" );
}

const createUserTwitterSearchLink = function( screen_name, search ) {
	return "https://twitter.com/search?q=from%3A" + encodeURIComponent( screen_name ) + "%20" + encodeURIComponent( search ) + "&src=typd";
}

const createTweetLink = function( screen_name, tweet_id ) {
	return createUserTwitterLink( screen_name ) +"/status/"+ tweet_id;
}

const createNewReceiptText = function( screen_name, number, left ) {
	return "test";
}

const createNewUserText = function( screen_name, number, left ) {
	return "test";
}

const createGoogleMapsLink = function( address ) {
	return "https://www.google.com/maps/place/" + encodeURIComponent( address );
}

module.exports.convertProfileImageUrl = convertProfileImageUrl
module.exports.formatCircleNumber = formatCircleNumber
module.exports.createUserTwitterLink = createUserTwitterLink
module.exports.createTweetLink = createTweetLink
module.exports.createGoogleMapsLink = createGoogleMapsLink
module.exports.createUserTwitterSearchLink = createUserTwitterSearchLink