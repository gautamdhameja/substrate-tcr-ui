import React, { Component } from 'react';
import Listings from './Listings'
import Popup from './Popup';
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
      listings: [],
      modal: false
    };
    this.applyListing = this.applyListing.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    service.getTcrDetails().then((details) => {
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
    this.getAllListings();
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  async applyListing(name, deposit) {
    service.applyListing(name, deposit).then(() => {
      this.getAllListings();
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.getAllListings();
  }

  getAllListings() {
    this.setState({ listings: [] });
    service.getAllListings().then((result) => {
      setTimeout(() => {
        for (const item of result) {
          this.setState({ listings: [...this.state.listings, item] });
        }
      }, 1000);
      this.setState({
        modal: false
      });
    });
  }

  render() {
    return (
      <div>
        <Popup modal={this.state.modal} submit={this.applyListing} toggle={this.toggle} />
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
          <br/>
          <div className="container text-left">
            <span className="h3">Listings</span>
            <button className="btn btn-secondary float-right" style={{marginLeft:10}} type="button" onClick={this.handleSubmit}>Get All Listings</button>
            <button className="btn btn-primary float-right" onClick={this.toggle}>Apply Listing</button>
            <br/><br/><br/>
            <div className="text-left">
              <Listings list={this.state.listings} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
