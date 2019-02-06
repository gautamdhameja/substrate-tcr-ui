import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import Listings from './Listings'
import ApplyPopup from './modals/Apply';
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
      modal: false,
      inProgress: false,
      seed: "",
      balance: 0
    };

    this.applyListing = this.applyListing.bind(this);
    this.getSeedBalance = this.getSeedBalance.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    this.getSeedBalance();
    service.connect().then((connect) => {
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

  applyListing(name, deposit) {
    this.setState({ inProgress: true });
    service.applyListing(this.state.seed, name, deposit).then((result) => {
      console.log(result);
      this.setState({ inProgress: false });
      this.toggle();
      this.getAllListings();
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.getAllListings();
  }

  handleSeedChange(event) {
    this.setState({ seed: event.target.value });
  }

  saveSeed(event) {
    event.preventDefault();
    localStorage.setItem("seed", this.state.seed);
    this.getBalance();
  }

  getSeedBalance() {
    const localSeed = localStorage.getItem("seed");
    if (localSeed) {
      service.getBalance(localSeed)
        .then((result) => {
          this.setState({ balance: result, seed: localSeed });
        });
    }
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
        <ApplyPopup modal={this.state.modal} submit={this.applyListing} toggle={this.toggle} header={"Apply Listing"} inProgress={this.state.inProgress} />
        <div className="container text-center">
          <br />
          <p className="h2">Substrate TCR</p>
          <br />
          <div className="alert alert-primary text-left">
            <div>
              <div className="alert alert-success">
                Chain: <b>{this.state.connection.chain}</b>; Node Name: <b>{this.state.connection.name}</b>; Version: <b>{this.state.connection.version}</b>
              </div>
              <Row>
                <Col>
                  <p><b>TCR Parameters</b></p>
                  <p>Minimum Deposit (tokens): <b>{this.state.tcrDetails.minDeposit}</b></p>
                  <p>Apply Stage Period (seconds): <b>{this.state.tcrDetails.applyStageLen}</b></p>
                  <p>Commit Stage Period (seconds): <b>{this.state.tcrDetails.commitStageLen}</b></p>
                </Col>
                <Col>
                  <p><b>Passphrase</b></p>
                  <Row>
                    <Col xs="10">
                      <input type="text" name="seed" id="seed" className="form-control" value={this.state.seed}     onChange={this.handleSeedChange.bind(this)} />
                    </Col>
                    <Col xs="2">
                      <button className="btn btn-primary" onClick={this.saveSeed.bind(this)}>Save</button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      Token Balance: <b>{this.state.balance}</b>
                      <button className="btn btn-link" onClick={this.getSeedBalance}>refresh</button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
          <br />
          <div className="container text-left">
            <span className="h3">Listings</span>
            <button className="btn btn-secondary float-right" style={{ marginLeft: 10 }} type="button" onClick={this.handleSubmit}>Get Listings</button>
            <button className="btn btn-primary float-right" onClick={this.toggle}>Apply Listing</button>
            <br /><br /><br />
            <div className="text-left">
              <Listings list={this.state.listings} />
            </div>
            <br /><br />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
