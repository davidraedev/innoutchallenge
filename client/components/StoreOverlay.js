import React from "react"
import { connect } from "react-redux"

import { fetchStoreInfo } from "../actions/storeActions"

require( "../less/StoreOverlay.less" )

@connect( ( store ) => {
	console.log( "StoreOverlay store a" , store)
	return {
		store: store.overlayStore,
	}
})

export default class StoreOverlay extends React.Component {

	componentWillMount() {
		this.setState({
			display: ( this.props.number ),
			number: null,
		})
	}

	hideOverlay() {
		this.setState({
			display: false,
		})
	}

	componentWillReceiveProps( new_props ) {
		if ( new_props.number ) {
			console.log( "StoreOverlay new_props a", new_props )
			if ( new_props.number !== this.state.number ) {
				console.log( "StoreOverlay new_props b" )
				this.setState({
					number: new_props.number,
				})
				this.props.dispatch( fetchStoreInfo( this.props.dispatch, new_props.number ) )
			}
			else {
				console.log( "StoreOverlay new_props c" )
				this.setState({
					display: true,
				})
			}
		}
		else {
			console.log( "StoreOverlay new_props d" )
		}
	}

	formatHourNumber( hour, type ) {

		let hour_string = String( hour );

		let meridian; 
		if ( type === "start" )
			meridian = ( hour <= 1159 ) ? "am" : "pm";
		else
			meridian = ( hour <= 1159 ) ? "pm" : "am";

		let number_parts = hour_string.split( "" );
		console.log( "number_parts", number_parts )
		let colon_pos = ( number_parts.length === 3 ) ? 1 : 2;
		console.log( "colon_pos", colon_pos )
		number_parts.splice( colon_pos, 0, ":" );
		console.log( "number_parts", number_parts )
		return number_parts.join( "" ) + " " + meridian;
	}

	formatHourString( start, end ) {
		return this.formatHourNumber( start, "start" ) + " - " + this.formatHourNumber( end, "end" );
	}

	hoursHtml( data, exists ) {

		let html = (
			<div class="table">
				<div class="row">
					<div class="cell">None at this store</div>
				</div>
			</div>
		);

		if ( exists ) {
			html = (
				<div class="table">
					<div class="row">
						<div class="cell">Mon - Thu:</div>
						<div class="cell">{ this.formatHourString( data.monday.start, data.monday.end ) }</div>
					</div>
					<div class="row">
						<div class="cell">Fri - Sat:</div>
						<div class="cell">{ this.formatHourString( data.friday.start, data.friday.end ) }</div>
					</div>
					<div class="row">
						<div class="cell">Sunday:</div>
						<div class="cell">{ this.formatHourString( data.sunday.start, data.sunday.end ) }</div>
					</div>
				</div>
			)
		}

		return html;
	}

	render() {

		console.log( "StoreOverlay2 props b", this.props )

		const { number, store } = this.props;
		console.log( "StoreOverlay2 store", store )
		let location = store.store.location

		console.log( "store.store", store.store )

		let instore_hours = this.hoursHtml( store.store.dining_room_hours, store.store.dining_room );
		let drive_thru_hours = this.hoursHtml( store.store.drive_thru_hours, store.store.drive_thru );

		let content = null;
		if ( this.state.display ) {
			content = (
				<div>
					<div class="store_overlay_background" onClick={ () => { this.hideOverlay(); } }></div>
					<div class="store_overlay">
						<div class="outer container">

							<div class="inner container">

								<div class="number_container">
									<div class="background"></div>
									<div class="number">{ number }</div>
								</div>

								<div class="address_container">
									<div class="address">
										<p>{ location.address }</p>
										<p>{ location.city }, { location.state } { location.zipcode }</p>
									</div>
								</div>

								<div class="hours_container">

									<div class="hours">
										<div class="title">Dining Room</div>
										{ instore_hours }
									</div>

									<div class="hours">
										<div class="title">Drive-Thru</div>
										{ drive_thru_hours }
									</div>

								</div>

							</div>

							<div class="title">
								<div class="text">
									<p>S</p>
									<p>T</p>
									<p>O</p>
									<p>R</p>
									<p>E</p>
								</div>
							</div>

						</div>

						<div class="map container outer">

							<div class="inner container">

								

							</div>

							<div class="title">
								<div class="text">
									<p>M</p>
									<p>A</p>
									<p>P</p>
								</div>
							</div>

						</div>

					</div>

				</div>
			)
		}

		return content;
	}
}