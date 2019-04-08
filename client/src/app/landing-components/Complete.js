import React, { PureComponent } from "react";
import "./Complete.scss";

class Complete extends PureComponent {
  constructor(props) {
	super(props);
	
	this.state = {};
  }

  render() {
    return (
		<div>
			<h2>
				Done.
			</h2>
			<p>
				Sarah has been notified and will be in contact shortly.
			</p>
		</div>
    );
  }
}

export default Complete;
