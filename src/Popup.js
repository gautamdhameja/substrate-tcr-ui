import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';

class Popup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listingName: "",
            listingDeposit: "",
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleNameChange(event) {
        this.setState({ listingName: event.target.value });
    }

    handleDepositChange(event) {
        this.setState({ listingDeposit: event.target.value });
    }

    handleSubmit() {
        this.props.submit(this.state.listingName, this.state.listingDeposit);
    }

    render() {
        return (<div>
            <Modal isOpen={this.props.modal} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>{this.props.header}</ModalHeader>
                <ModalBody>
                    <div>
                        <label htmlFor="listingName">Listing Data</label>
                        <input type="text" name="listingName" id="listingName" className="form-control" value={this.state.listingName} onChange={this.handleNameChange.bind(this)} />
                        <br />
                        <label htmlFor="listingDeposit">Deposit</label>
                        <input type="text" name="listingDeposit" id="listingDeposit" className="form-control" value={this.state.listingDeposit} onChange={this.handleDepositChange.bind(this)} />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className="center">
                        { 
                            this.props.inProgress && 
                            <Spinner color="primary" />
                        }
                    </div>
                    <Button color="primary" onClick={this.handleSubmit}>Submit</Button>{' '}
                    <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>);
    }
}

export default Popup;