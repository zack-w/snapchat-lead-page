import React, { PureComponent } from "react";
import "./ElementNavButton.scss";
import { SketchPicker } from "react-color";

const popover = {
  position: 'absolute',
  zIndex: '2',
};

const cover = {
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
};

class ColorPickerButton extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showColorPicker: false,
      label: "Color",
      color: this.props.color || "#000000"
    };
  }

  componentDidUpdate() {
    this.setState({
      label: this.props.label || "Color",
      color: this.props.color || "#000000"
    })
  }

  render() {
    return (
      <div style={{margin: "20px 0"}}>
        <div>
          { this.state.showColorPicker &&
            <div style={popover}>
              <div style={ cover } onClick={() => this.setState({showColorPicker: false})}/>

              <SketchPicker
                color={this.state.color}
                onChangeComplete={(color) => {
                    if (this.props.onColorChange) {
                      this.props.onColorChange(color);
                    }
                }}
              />
            </div>
          }

          <span
            onClick={() => this.setState({showColorPicker: true})}
            style={{
              borderRadius: "50%",
              marginRight: "15px",
              maxHeight: "5px",
              backgroundColor: this.state.color,
              padding: "0 12px",
              boxShadow: `0 0 2px rgba(0,0,0,.3)`,
            }}
          >
            &nbsp;
          </span>

          <strong style={{color: "#333", fontWeight: 600}}>
            {this.state.label}
          </strong>
        </div>
      </div>
    );
  }
}

export default ColorPickerButton;
