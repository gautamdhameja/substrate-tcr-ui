import React, { Component } from 'react';
import Listings from './Listings'
import Popup from './Popup';
import './App.css';

import * as service from './service';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connection: {},
      tcrDetails: {
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
    service.main().then((connect) => {
      this.setState({
        connection: connect
      });
    });
    service.getTcrDetails().then((details) => {
      this.setState({
        tcrDetails: {
          minDeposit: details.mdTokens,
          applyStageLen: details.aslSeconds,
          commitStageLen: details.cslSeconds
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
    // service.applyListing(name, deposit).then(() => {
    //   this.getAllListings();
    // });
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
        <Popup modal={this.state.modal} submit={this.applyListing} toggle={this.toggle} header={"Apply Listing"} />
        <div className="container text-center">
          <br />
          <p className="h2">Substrate TCR</p>
          <br />
          <div className="alert alert-primary text-left">
            <div>
              <div class="alert alert-success" role="alert">
                Connected to - chain: <b>{this.state.connection.chain}</b>, node-name: <b>{this.state.connection.name}</b>, version: <b>{this.state.connection.version}</b>
              </div>
              <p><b>TCR Parameters</b></p>
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
