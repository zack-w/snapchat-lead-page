import React, { PureComponent } from "react";
import "./CampaignContent.scss";
import { DYNAMIC_STYLING } from "./Campaign";

const CONTENT_FIELDS = {
	"Landing Page": [
		{key: "landingTitleText", niceName: "Headline Text"},
		{key: "landingBodyText", niceName: "Body Text"},
		{key: "landingButtonText", niceName: "Call to Action"}
	],
	"Form Page": [
		{key: "formTitleText", niceName: "Headline Text"},
		{key: "formBodyText", niceName: "Body Text"}
	],
};

class CampaignContent extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			changedFields: {}
		};
	}

	updateField(contentFieldKey, value) {
		this.state.changedFields[contentFieldKey] = true;
		DYNAMIC_STYLING.content[contentFieldKey] = value;
		this.forceUpdate();
	}

	saveContentChanges() {
		if (this.props.saveStyleChanges) {
			this.props.saveStyleChanges();
		}

		this.setState({changedFields: {}});
	}

	render() {
		return (
			<div>
				<div style={{marginBottom: 20}}>
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

				{
					Object.keys(CONTENT_FIELDS).map((pageName => {
						return (
							<div>
								<h3>{pageName}</h3>
								<div className="simplePanel" style={{maxWidth: "500px", marginBottom: 20}}>
									{
										CONTENT_FIELDS[pageName].map((contentField) => {
											return (
												<div>
													<h4>{contentField.niceName}</h4>

													<textarea
														value={DYNAMIC_STYLING.content[contentField.key]}
														onChange={(evt) => this.updateField(contentField.key, evt.target.value)}
														onBlur={() => {
															if (this.state.changedFields[contentField.key]) {
																this.saveContentChanges();
															}
														}}
													></textarea>
												</div>
											)
										})
									}
								</div>
							</div>
						);
					}))
				}
			</div>
		);
	}
}

export default CampaignContent;
