import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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
      listingName: "",
      listingDeposit: "",
      listings: [],
      modal: false
    };
    this.applyListing = this.applyListing.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
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
    this.getAllListings();
  }

  handleNameChange(event) {
    this.setState({ listingName: event.target.value })
  }

  handleDepositChange(event) {
    this.setState({ listingDeposit: event.target.value })
  }

  async applyListing(event) {
    event.preventDefault();
    service.applyListing(this.state.listingName, this.state.listingDeposit, process.env.REACT_APP_TCR_ADDR).then(() => {
      this.getAllListings();
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.getAllListings();
  }

  getAllListings() {
    this.setState({ listings: [] });
    service.getAllListings(process.env.REACT_APP_TCR_ADDR).then((result) => {
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
        <div>
          <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
            <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
            <ModalBody>
              <div>
                <label htmlFor="listingName">Listing Name:</label>
                <input type="text" name="listingName" id="listingName" className="form-control" value={this.state.listingName} onChange={this.handleNameChange.bind(this)} />
                <br />
                <label htmlFor="listingDeposit">Deposit:</label>
                <input type="text" name="listingDeposit" id="listingDeposit" className="form-control" value={this.state.listingDeposit} onChange={this.handleDepositChange.bind(this)} />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.applyListing}>Submit</Button>{' '}
              <Button color="secondary" onClick={this.toggle}>Cancel</Button>
            </ModalFooter>
          </Modal>
        </div>
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
            <span className="h3">Listings</span>
            <button className="btn btn-secondary float-right" type="button" onClick={this.handleSubmit}>Get All Listings</button>
            <button className="btn btn-primary float-right" onClick={this.toggle}>Apply Listing</button>
            <br/> <br/>
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
