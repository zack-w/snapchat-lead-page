import React, { PureComponent } from "react";
import "./Dashboard.scss";
import ElementNavButton from "../shared/ElementNavButton";
import CampaignsListing from "../campaigns/CampaignsListing";

class Dashboard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
		<div className="dashboardLayoutPanel">
			<div className="left">
				<CampaignsListing />
			</div>

			<div className="right"></div>
		</div>
    );
  }
}

export default Dashboard;
