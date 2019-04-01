import React, { PureComponent } from "react";
import "./CampaignSummary.scss";

class CampaignSummary extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<h3>FIELDS COLLECTED</h3>

				<div>
					<button>Add Field</button>
				</div>

				<div className="simplePanel" style={{maxWidth: "500px", marginTop: 20}}>
					{
						(this.props.campaign.fields.length == 0 || true) && (
							<div style={{color: "#666", fontWeight: 200, fontSize: 14}}>
								You have not yet added any fields.
							</div>
						)
					}
					{
						(this.props.campaign.fields.length > 0 && false) && (
							this.props.campaign.fields.map((field) => {
								return (
									<div key={`campaign-field-${field.id}`} className="element">
										{field.key}
									</div>
								);
							})
						)
					}
				</div>
			</div>
		);
	}
}

export default CampaignSummary;
