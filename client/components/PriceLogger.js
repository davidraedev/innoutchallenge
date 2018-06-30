import React from "react"
import { connect } from "react-redux"

//import { fetchAccount, changeSetting, deleteAccount } from "../actions/accountActions"

//import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
//import PageNotFound from "./PageNotFound"
//import PageNotAuthorized from "./PageNotAuthorized"

require( "../less/PriceLogger.less" )
/*
@connect( ( store ) => {
	console.log( "store", store )
	return {
		stores: store.stores,
	}
})
*/
export default class PriceLogger extends React.Component {

	componentWillMount() {

		//this.props.dispatch( fetchAccount( this.props.dispatch ) )

		//this.changeSettingHandler = this.changeSettingHandler.bind( this )
		//this.deleteAccountHandler = this.deleteAccountHandler.bind( this )
	}

	priceInputHtml( value = "", tabindex = 0 ) {
		return (
			<div class="price">
				<div class="input">
					<input type="number" placeholder="1.00" step="0.01" defaultValue={ value } tabIndex={ tabindex } />
				</div>
			</div>
		)
	}

	render() {

		let tabindex = 3;

		//const { account, error } = this.props;
		let date = new Date();

		let burgers = [
			{ name: "Double-Double" },
			{ name: "Cheeseburger" },
			{ name: "Hamburger" },
			{ name: "French Fries" },
		];
		let burgers_html = burgers.map( ( burger ) => {
			return (
				<div class="item">
					<div class="title">{ burger.name.toUpperCase() }</div>
					{ this.priceInputHtml( "", tabindex++ ) }
				</div>
			)
		});

		let sodas = [
			{ name: "Coke" },
			{ name: "Root Beer" },
			{ name: "Lemonade" },
			{ name: "Iced Tea" },
			{ name: "Seven-Up" },
			{ name: "Dr Pepper" },
		];
		let soda_row_length = 4;
		let sodas_row_1 = sodas.slice( 0, soda_row_length ).map( ( soda ) => {
			return (
				<div class="soda">{ soda.name.toUpperCase() }</div>
			);
		});
		let sodas_row_2 = sodas.slice( soda_row_length ).map( ( soda ) => {
			return (
				<div class="soda">{ soda.name.toUpperCase() }</div>
			);
		});

		let soda_prices = [
			{ name: "SM" },
			{ name: "MED" },
			{ name: "LG" },
			{ name: "X-LG" },
		];
		let soda_prices_html = soda_prices.map( ( soda_price ) => {
			return (
				<div class="item">
					<div class="title">{ soda_price.name }</div>
					{ this.priceInputHtml( "", tabindex++ ) }
				</div>
			);
		});

		let other_drinks = [
			{ name: "Shakes" },
			{ name: "Milk" },
			{ name: "Coffee" },
			{ name: "Hot Cocoa" },
		];
		let other_drinks_html = other_drinks.map( ( other_drink ) => {
			return (
				<div class="item">
					<div class="title">{ other_drink.name.toUpperCase() }</div>
					{ this.priceInputHtml( "", tabindex++ ) }
				</div>
			);
		});

		return	(
			<div>
				<TopNav title="Price Logger" showBackButton={ false } />
				<div class="container" id="price_logger">
					<div class="section options">
						<div>
							Date: <div class="input">
								<input type="date" defaultValue={ date.toISOString().substr( 0, 10 ) } tabIndex="1" />
							</div>
						</div>
						<div>
							Store: <div class="input">
								<input type="number" placeholder="0" tabIndex="2" />
							</div>
						</div>
					</div>
					<div class="section">
						<div class="ino_menu">
							<div class="burgers">
								{ burgers_html }
							</div>
							<div class="middle">
								<div class="item top"></div>
								<div class="item bottom"></div>
							</div>
							<div class="drinks">
								<div class="sodas">
									<div class="names_wrap">
										<div class="names">
											<div class="column">{ sodas_row_1 }</div>
											<div class="column">{ sodas_row_2 }</div>
										</div>
										<div class="prices">
											{ soda_prices_html }
										</div>
									</div>
								</div>
								<div class="other_drinks">
									{ other_drinks_html }
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}