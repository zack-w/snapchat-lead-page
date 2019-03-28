import React, { PureComponent } from "react";
import Header from "./components/Header";
import Form from "./components/Form";
import Landing from "./components/Landing";

class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showForm: false
    };
  }

  render() {
    return (
      <div style={{paddingBottom: 20}}>
        <Header />

        {
          this.state.showForm
          ? <Form />
          : <Landing onSubmit={() => this.setState({showForm: true})}/>
        }
      </div>
    );
  }
}
export default App;