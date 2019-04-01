import React, { PureComponent } from "react";
import "./CampaignIntegrations.scss";

class CampaignIntegrations extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			selectedTab: 0
		};
	}

	render() {
		return (
			<div className="simplePanel wrapper">
				<div>
					<img src="/assets/img/zapier-logo.png" />
				</div>

				<h1>
					We use Zapier to integrate with 1,000+ apps.
				</h1>

				<br />

				<a href="https://zapier.com" target="_blank">
					<button>
						Integrate using Zapier
					</button>
				</a>

				<br /><br />

				<iframe width="560" height="315" src="https://www.youtube.com/embed/yG90m3H_kgA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
			</div>
		);
	}
}

export default CampaignIntegrations;
