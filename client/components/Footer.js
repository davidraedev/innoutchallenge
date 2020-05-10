import React from "react"

require( "../less/TopNav.less" )

export default class TopNav extends React.Component {

	render() {

		return	(
			<div class="top">
				<nav id="top_nav">
					<div class="logo"></div>
					<ul class="dropdown">
						<li>
							<i class="fa fa-bars icon" aria-hidden="true"></i>
							<ul class="dropdown_target">
								<li>Challengers</li>
								<li>Store</li>
								<li>About</li>
								<li>Sign In</li>
							</ul>
						</li>
					</ul>
					<div class="text">
						Challengers
					</div>
				</nav>
			</div>
		)
	}
}