import React, { Component } from 'react';
import Listings from './Listings'
import './App.css';

import * as service from './service';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listingName: null,
      listings: []
    };
    this.applyListing = this.applyListing.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleValueChange(event) {
    this.setState({ listingName: event.target.value })
  }

  async applyListing(event) {
    event.preventDefault();
    const applyListing = await service.applyListing(this.state.listingName, process.env.REACT_APP_TCR_ADDR);
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ listings: [] });
    const result = await service.getAllListings(process.env.REACT_APP_TCR_ADDR);
    setTimeout(() => {
      for (const item of result) {
        this.setState({ listings: [...this.state.listings, item] });
      }
    }, 1000);
  }

  render() {
    return (
        <div className="container text-center">
        <br/>
          <p className="h2">Simple Token Curated Registry</p>
          <br />
          <div className="alert alert-primary text-left">
            <br />
            <p className="h4">TCR Details</p>
          </div>
          <div className="container-fluid text-left">
            <form className="inputForm" onSubmit={this.handleSubmit}>
              <span className="h3">All Listings</span>
              <button className="btn btn-secondary float-right" type="submit">Get All Listings</button>
            </form>
            <br />
            <div className="text-left">
              <Listings list={this.state.listings} />
            </div>
          </div>
        </div>
    );
  }
}

{/* <form className="inputForm" onSubmit={this.applyListing}>
<div>
  <label htmlFor="listingName">Listing Name:</label>
  <input type="text" name="listingName" id="listingName" className="form-control" value={this.state.listingName} onChange={this.handleValueChange.bind(this)} />
  <br />
  <label htmlFor="listingDeposit">Deposit:</label>
  <input type="text" name="listingDeposit" id="listingDeposit" className="form-control" value={this.state.listingDeposit} onChange={this.handleValueChange.bind(this)} />
  <br />
  <button className="btn btn-primary" type="submit">Apply</button>
</div>
</form> */}

export default App;
