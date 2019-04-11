import React, { PureComponent } from "react";
import "./Landing.scss";
import { DYNAMIC_STYLING } from "../LandingApp";

class Landing extends PureComponent {
  constructor(props) {
    super(props);
  }

  onSubmit() {
	/* var request = {
		onComplete: function(info) {
			
		},

		fields: ['name', 'email', 'phone']
	};

	snaptr('autofill', request); */

	this.props.onSubmit();
  }

  render() {
    return (
		<div>
			<h1>
				{DYNAMIC_STYLING.content.landingTitleText}
			</h1>

			<p>
				{DYNAMIC_STYLING.content.landingBodyText}
			</p>

			<div className="callToActionWrapper">
				<button onClick={() => this.onSubmit()}>
					{DYNAMIC_STYLING.content.landingButtonText}!
				</button>
			</div>
		</div>
    );
  }
}

export default Landing;
