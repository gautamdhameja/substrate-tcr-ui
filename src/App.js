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
    this.setState({listingName: event.target.value})
  }

  async applyListing(event) {
    event.preventDefault();
    const applyListing = await service.applyListing(this.state.listingName, process.env.REACT_APP_TCR_ADDR);
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
      <section className="jumbotron text-center">
      <div className="container">
        <h2>Simple Token Curated Registry</h2>
        <br/><br/>
            <div className="alert alert-warning">
              <form className="inputForm" onSubmit={this.applyListing}>
                <div>
                  <label htmlFor="inputValue" className="sr-only">Listing Name:</label>
                  <input type="text" name="inputValue" id="inputValue" className="form-control" value={this.state.listingName} onChange={this.handleValueChange.bind(this)}/>
                  <button className="btn btn-lg btn-primary btn-block" type="submit">Apply</button>
                </div>
              </form>
            </div>
            <br/>
            <div className="row">
              <div className="col-6">
                <div className="lead-body">
                <form className="inputForm" onSubmit={this.handleSubmit}>
                  <div>
                    <button className="btn btn-lg btn-primary btn-block" type="submit">Get All</button>
                  </div>
                </form>
                <h3>All Listings</h3>
                  <div>
                    <Listings list={this.state.listings} />
                  </div>
                </div>
              </div>
            </div>
      </div>
    </section>
    );
  }
}

export default App;
