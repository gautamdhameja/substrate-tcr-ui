import React, { Component } from 'react';
import Listings from './Listings'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listings: [
        {
          name: "Listing1", 
          hash: "", 
          deposit: 200, 
          isWhitelisted: false, 
          owner: ""
        }
      ]
    };
  }
  render() {
    return (
      <div className="App">
        <h2>Simple Token Curated Registry</h2>
        <h3>Top Listings</h3>
        <div>
          <Listings list={this.state.listings} />
        </div>
      </div>
    );
  }
}

export default App;
