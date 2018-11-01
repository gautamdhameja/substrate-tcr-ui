import React, { Component } from 'react';
import Listings from './Listings'
import './App.css';

import * as service from './service';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tcrDetails: {
        name: "",
        tokenAddress: "",
        minDeposit: "",
        applyStageLen: "",
        commitStageLen: ""
      },
      listingName: null,
      listings: [],
    };
    this.applyListing = this.applyListing.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    service.getTcrDetails(process.env.REACT_APP_TCR_ADDR).then((details) => {
      this.setState({
        tcrDetails: {
          name: details[0],
          tokenAddress: details[1],
          minDeposit: details[2],
          applyStageLen: details[3],
          commitStageLen: details[4]
        }
      });
    });
    service.getAllListings(process.env.REACT_APP_TCR_ADDR).then((result) => {
      for (const item of result) {
        this.setState({ listings: [...this.state.listings, item] });
      }
    });
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
          <br />
          <p className="h2">*Simple* Token Curated Registry</p>
          <br />
          <div className="alert alert-primary text-left">
            <p><b>TCR Details</b></p>
            <div>
              <p>Registry Name: <b>{this.state.tcrDetails.name}</b></p>
              <p>Token Address: <b>{this.state.tcrDetails.tokenAddress}</b></p>
              <p>Minimum Deposit (tokens): <b>{this.state.tcrDetails.minDeposit}</b></p>
              <p>Apply Stage Period (seconds): <b>{this.state.tcrDetails.applyStageLen}</b></p>
              <p>Commit Stage Period (seconds): <b>{this.state.tcrDetails.commitStageLen}</b></p>
            </div>
          </div>
          <div className="container-fluid text-left">
            <form className="inputForm" onSubmit={this.handleSubmit}>
              <span className="h3">Listings</span>
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
