import React, { Component } from 'react';
import Listings from './Listings'
import './App.css';

import * as service from './service';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listings: []
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event) {
      event.preventDefault();
      const result = await service.getAllListings(process.env.REACT_APP_TCR_ADDR);
      setTimeout(() => {
        console.log(Object.keys(result), result);
        for (const item of result) {
          this.setState({ listings: [...this.state.listings, item]});
          console.log(this.state.listings);
        }
      }, 1000);
  }

  render() {
    return (
      <div className="App">
        <h2>Simple Token Curated Registry</h2>
        <br/>
            <div className="lead-body">
              <form className="inputForm" onSubmit={this.handleSubmit}>
                <div>
                  <button className="btn btn-lg btn-primary btn-block" type="submit">Get All</button>
                </div>
              </form>
            </div>
        <h3>Top Listings</h3>
        <div>
          <Listings list={this.state.listings} />
        </div>
      </div>
    );
  }
}

export default App;
