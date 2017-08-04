const convertProfileImageUrl = function( url, size ) {
	let regex = /(_[a-zA-Z0-9]+)?(\.\w+)/;
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

module.exports = {
	convertProfileImageUrl: convertProfileImageUrl,
};