require( "dotenv" ).config( process.env.ENV_PATH );

const rand = function( min, max ) {
	min = Math.ceil( min );
	max = Math.floor( max );
	return ( Math.floor( Math.random() * ( max - min + 1 ) ) + min );
};

const createUserUrl = function( screen_name ) {
	return process.env.FRONTEND_DOMAIN +"/@"+ screen_name;
};

const leftPad = function( num, size, char ) {
	var s = num + "";
	while ( s.length < size )
		s = char + s;
	return s;
};

const loop = function( callback, delay ) {
	
	callback().then( () => {
		setTimeout( () => {
			loop( callback, delay );
		}, delay );
	});

};

module.exports = {
	rand: rand,
	createUserUrl: createUserUrl,
	leftPad: leftPad,
	loop: loop,
};