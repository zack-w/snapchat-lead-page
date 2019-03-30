import React, { PureComponent } from "react";
import "./CampaignsListing.scss";
import ElementNavButton from "../shared/ElementNavButton";
import { navigate } from "../../router";
import HashLoader from "react-spinners/HashLoader";
import { API_URL } from "../../App";
import axios from "axios";

class CampaignsListing extends PureComponent {
  constructor(props) {
	super(props);
	
	this.state = {
		loading: true,
		campaigns: []
	};
  }

  async loadCampaigns() {
		try {
			let res = await axios.get(`${API_URL}/me/campaigns`);

			// Update the state
			this.setState({
				loading: false,
				campaigns: res.data
			})
		} catch(ex) {
			console.log("ERROR");
			console.log(ex);
		}
  }

  componentDidMount() {
		this.loadCampaigns();
  }

  render() {
		let params = this.props.params ? this.props.params : {};

		// If we are loading
		if (this.state.loading) {
			return (
				<div style={{width: "100%"}}>
					<h3>CAMPAIGNS</h3>
		
					<div style={{marginTop: "3vh"}}>
						<HashLoader
							css={{marginLeft: '15px', marginTop: '15px'}}
							sizeUnit={"px"}
							size={50}
							color={'#0a75c1'}
							loading={this.state.loading}
						/>
					</div>
				</div>
			);
		}

    return (
			<div style={{width: "100%"}}>
				<h3>CAMPAIGNS</h3>

				{
					(this.state.campaigns.length > 0) &&
					this.state.campaigns.map((campaign) => {
						return (
							<a href={`/campaign/${campaign.id}`} onClick={navigate}>
								<ElementNavButton title={campaign.name} />
							</a>
						);
					})
				}
			</div>
    );
  }
}

export default CampaignsListing;
