const fs = require( "fs" );

if ( ! process.env.NODE_ENV )
	throw new Error( "missing NODE_ENV" );

if ( ! process.env.ENV_PATH )
	throw new Error( "missing ENV_PATH" );

let env_path = ( process.env.ENV_PATH === ".env.production" ) ? ".env.production" : ".env.dev";

require( "dotenv" ).config( { path: env_path } );
const debug = process.env.NODE_ENV !== "production";
const webpack = require( "webpack" );
const path = require( "path" );
const UglifyJSPlugin = require( "uglifyjs-webpack-plugin" );
const Dotenv = require( "dotenv-webpack" );

let plugins = [
	new Dotenv({
		path: env_path, 
		safe: false,
	})
];
if ( ! debug )
	plugins.push( new UglifyJSPlugin() );

module.exports = {
	node: {
		fs: "empty",
	},
	context: path.resolve( __dirname, "client" ),
	devtool: debug ? "inline-sourcemap" : false,
	entry: "./client.js",
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: "babel-loader",
				query: {
					presets: [ "react", "es2015", "stage-0" ],
					plugins: [ "react-html-attrs", "transform-class-properties", "transform-decorators-legacy" ],
				},
			},
			{
				test: /\.less$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader", options: { minimize: ! debug } },
					{ loader: "less-loader" },
				],
			},
		],
	},
	plugins: plugins,
	output: {
		path: path.resolve( __dirname, "client/build" ),
		filename: "bundle.js",
	},
	devServer: {
		contentBase: path.resolve( __dirname, "client/build" ),
		historyApiFallback: true,
		host: "127.0.0.1",
		port: 8080,
		proxy: [
			{
				context: [ "/api/**", "/img/**", "/font/**" ],
				target: "http://127.0.0.1:3000/",
				secure: false,
			},
		],
	},
};