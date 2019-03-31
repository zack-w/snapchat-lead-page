import React, { PureComponent } from "react";
import "./ElementNavButton.scss";

class ElementNavButton extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
		<div className="elementNavButton">
			<div className="title">
				{this.props.title}
			</div>
		</div>
    );
  }
}

export default ElementNavButton;
