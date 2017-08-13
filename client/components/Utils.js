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

module.exports.convertProfileImageUrl = convertProfileImageUrl
module.exports.formatCircleNumber = formatCircleNumber