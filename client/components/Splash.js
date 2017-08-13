import React from "react"
import Helmet from "react-helmet"

import TopNav from "./TopNav"

require( "../less/Splash.less" )

export default class Splash extends React.Component {

	componentWillMount() {
		this.updateDimensions();
		this.setState({
			images: {
				obtain_innout: {
					url: "splash_obtain_innout.jpg",
					original: {
						width: 336,
						height: 527,
					},
					"800": {
						width: 231,
						height: 362,
					}
				},
				tweet_receipt: {
					url: "splash_tweet_receipt.jpg",
					original: {
						width: 357,
						height: 474,
					},
					"800": {
						width: 284,
						height: 377,
					}
				},
				repeat: {
					url: "splash_repeat.jpg",
					original: {
						width: 526,
						height: 350,
					},
					"800": {
						width: 320,
						height: 213,
					}
				}
			}
		});
		this.resizeImage = this.resizeImage.bind( this );
		this.updateDimensions = this.updateDimensions.bind( this );
	}

	componentDidMount() {
		window.addEventListener( "resize", this.updateDimensions );
	}

	componentWillUnmount() {
		window.removeEventListener( "resize", this.updateDimensions );
	}

	updateDimensions() {
		var w = window,
			d = document,
			documentElement = d.documentElement,
			body = d.getElementsByTagName( "body" )[0],
			width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
			height = w.innerHeight || documentElement.clientHeight || body.clientHeight;

		this.setState({
			width: width,
			height: height,
		});
	}

	resizeImage( image ) {
		if ( this.state.width < 800 )
			return this.state.images[ image ]["800"];
		else
			return this.state.images[ image ].original;
	}

	render() {

		let nice_domain = process.env.REACT_APP_FRONTEND_URL.replace( /https?:\/\//, "" )

		return (
			<div>

				<Helmet>
					<link rel="stylesheet" href={ process.env.REACT_APP_BACKEND_URL + "/font/league-gothic/stylesheet.css" } integrity="sha384-FtHmOXxOCXs2W0piGYygAPT9dXMNmExBG+hYbKgg0e3L5CQQu5uJ9U2qlMfcAH+O" type="text/css" crossorigin="anonymous" />
				</Helmet>

				<TopNav showBackButton={ false } />
				<div class="container" id="splash_content">
					
					<div class="intro">
						<img class="img_welcome" src="img/splash_welcome.png" />
						<img class="img_to_the" src="img/splash_to_the.png" />
						<img class="img_logo" src="img/splash_logo.png" />
					</div>

					<div class="section">

						<div class="title"><div class="text">INSTRUCTIONS</div></div>

						<div class="items">

							<div class="item obtain_innout">

								<div class="column">

									<div class="header">1. Buy In-N-Out</div>

									<div class="point">
										Requires Money
									</div>

								</div>

								<div class="column image_col">
									<div class="image">
										<img src="img/splash_obtain_innout.jpg" style={ this.resizeImage( "obtain_innout" ) } />
									</div>
								</div>

							</div>

							<div class="item">

								<div class="column">

									<div class="header">2. Tweet Receipt Number</div>

									<div class="point">
										Examples:
										<div class="sub marked_correct">"Number Fifty-Five! #innoutChallenge"</div>
										<div class="sub marked_correct">"Number 66! #innoutChallenge"</div>
										<div class="sub marked_correct">"77! #innoutChallenge"</div>
									</div>

									<div class="point">
										Receipt numbers cannot be in hashtags.
										<div class="sub marked_wrong">"#11 #innoutChallenge"</div>
									</div>

									<div class="point">
										If you want to use the hashtag, but not for the challenge, just put a "#!" in.
										<div class="sub">"Still waiting for a presidential candidate to join the #innoutChallenge 4 8 15 16 23 42 #!"</div>
									</div>

									<div class="point">
										Add your store number in the format #storeNUMBER
										<div class="sub">"Number One! #innoutChallenge #store123"</div>
									</div>

									<div class="point">
										You may alternatively geotag with Exact Coordinates or the In-N-Out Burger Point of Interest only (no cities, etc)
									</div>

								</div>

								<div class="column image_col">
									<div class="image">
										<img src="img/splash_tweet_receipt.jpg" style={ this.resizeImage( "tweet_receipt" ) } />
									</div>
								</div>
								
							</div>

							<div class="item">

								<div class="column">

									<div class="header">3. Repeat</div>

									<div class="point">
										Requires More Money
									</div>

								</div>

								<div class="column image_col">
									<div class="image">
										<img src="img/splash_repeat.jpg" style={ this.resizeImage( "repeat" ) } />
									</div>
								</div>

							</div>

						</div>

					</div>

					<div class="section">

						<div class="title"><div class="text">FAQ</div></div>

						<div class="items">

							<div class="item">
								<div class="column">
									<div class="header">Do I get anything for finishing?</div>
									<div class="point">High blood pressure, most likely.</div>
								</div>
							</div>

							<div class="item">
								<div class="column">
									<div class="header">Can I share receipts?</div>
									<div class="point">Nope, only the buyer gets the receipt number.</div>
								</div>
							</div>

							<div class="item">
								<div class="column">
									<div class="header">Is this owned by In-N-Out?</div>
									<div class="point">Not at all! We’re just some fans doing what needs to be done.<br />That said, if they wanted to make it official we wouldn’t decline.</div>
								</div>
							</div>

						</div>

					</div>

				</div>
			</div>
		)
	}
}