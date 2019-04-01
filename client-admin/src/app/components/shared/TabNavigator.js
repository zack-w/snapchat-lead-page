import React, { PureComponent } from "react";
import "./TabNavigator.scss";

class TabNavigator extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: 0
    };
  }

  selectTab(idx, page) {
    this.setState({selectedTab: idx})
  }

  render() {
    if (!this.props.pages) {
      return <div></div>
    }

    return (
      <div>
        {/* Draw the navigation bar */}
        <div className="tabNav simplePanel">
          {
            this.props.pages.map((page, idx) => {
              return (
                <div onClick={() => this.selectTab(idx, page)}>
                    <a>
                        <img src={page.image} />
                        <br />
                        {page.title}
                    </a>

                    { this.state.selectedTab == idx
                      ? <div className="bottomBar">&nbsp;</div>
                      : <div className="bottomBarEmpty">&nbsp;</div>
                    }
                </div>
              );
            })
          }
        </div>

        {/* Render the tab */}
        <div className="tabContent">
          {this.props.pages[this.state.selectedTab].draw()}
        </div>
      </div>
    );
  }
}

export default TabNavigator;
