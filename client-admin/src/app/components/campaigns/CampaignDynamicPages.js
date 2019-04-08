import React, { PureComponent } from "react";
import { Container, Row, Col } from 'react-grid-system';
import "./CampaignDynamicPages.scss";

class CampaignDynamicPages extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<div class="simplePanel">
					<strong>What are dynamic pages?</strong>
					
					<div>
						Dynamic pages are our most powerful tool that allow you to generate lots of lead pages that are
						highly customized for your desired audience. For each dynamic page you create, your variables
						will be used to make a custom page with its own website address. You can then track impressions,
						clicks, and actions for each seperate dynamic page. Your variables can also be used in your
						integrations!
					</div>
				</div>
			</div>
		);
	}
}

export default CampaignDynamicPages;
