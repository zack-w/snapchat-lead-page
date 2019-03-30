import React, { PureComponent } from "react";
import "./Landing.scss";

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
				The first premium electric scooter just came to UMD
			</h1>

			<p>
				Our ambassador will meet you on campus and give you a free demo.
				No strings attached.
			</p>

			<div className="callToActionWrapper">
				<button onClick={() => this.onSubmit()}>
					RIDE NOW
				</button>
			</div>
		</div>
    );
  }
}

export default Landing;
