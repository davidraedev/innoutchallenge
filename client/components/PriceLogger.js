import React from "react"
import { connect } from "react-redux"

//import { fetchAccount, changeSetting, deleteAccount } from "../actions/accountActions"

//import Error from "./Error"
import TopNav from "./TopNav"
import SubNav from "./SubNav"
//import PageNotFound from "./PageNotFound"
//import PageNotAuthorized from "./PageNotAuthorized"

//require( "../less/PriceLogger.less" )
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

	render() {

		//const { account, error } = this.props;
		let date = new Date();
		let date_formatted = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();

		return	(
			<div>
				<TopNav title="Price Logger" showBackButton={ false } />
				<div class="container" /*id="account_content"*/>
					<div class="section">
						<div>
							Date: <div class="input">
								<input type="date" value={ date_formatted } />
							</div>
						</div>
						<div>
							Store: <div class="input">
								<input type="number" placeholder="0" />
							</div>
						</div>
					</div>
					<div class="section">
						<div class="ino_menu">
							<div class="burgers">
								<div class="item">
									<div class="title">DOUBLE-DOUBLE</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
								<div class="item">
									<div class="title">CHEESEBURGER</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
								<div class="item">
									<div class="title">HAMBURGER</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
								<div class="item">
									<div class="title">FRENCH FRIES</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
							</div>
							<div class="middle">
								<div class="item top"></div>
								<div class="item bottom"></div>
							</div>
							<div class="drinks">
								<div class="sodas">
									<div class="soda">COKE</div>
									<div class="soda">ROOT BEER</div>
									<div class="soda">LEMONADE</div>
									<div class="soda">ICED TEA</div>
									<div class="soda">SEVEN-UP</div>
									<div class="soda">DR PEPPER</div>
									<div class="prices">
										<div class="item">
											<div class="title">SM</div>
											<div class="price">
												<div class="input">
													$<input type="number" placeholder="1.00" />
												</div>
											</div>
										</div>
										<div class="item">
											<div class="title">MED</div>
											<div class="price">
												<div class="input">
													$<input type="number" placeholder="1.00" />
												</div>
											</div>
										</div>
										<div class="item">
											<div class="title">LG</div>
											<div class="price">
												<div class="input">
													$<input type="number" placeholder="1.00" />
												</div>
											</div>
										</div>
										<div class="item">
											<div class="title">X-LG</div>
											<div class="price">
												<div class="input">
													$<input type="number" placeholder="1.00" />
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="item">
									<div class="title">SHAKES</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
								<div class="item">
									<div class="title">MILK</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
								<div class="item">
									<div class="title">COFFEE</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
								<div class="item">
									<div class="title">HOT COCOA</div>
									<div class="price">
										<div class="input">
											$<input type="number" placeholder="1.00" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}