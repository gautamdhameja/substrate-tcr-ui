import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';

class VotePopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deposit: "",
            voteVal: ""
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleVoteValChange(event) {
        this.setState({ voteVal: event.target.value });
    }

    handleDepositChange(event) {
        this.setState({ deposit: event.target.value });
    }

    handleSubmit() {
        if (this.state.voteVal === 'aye') {
            this.props.submit(true, this.state.deposit);
        } else if (this.state.voteVal === 'nay') {
            this.props.submit(false, this.state.deposit);
        } else {
            alert("Please enter correct values.");
        }
    }

    render() {
        return (<div>
            <Modal isOpen={this.props.modal} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>{this.props.header}</ModalHeader>
                <ModalBody>
                    <div>
                        <label htmlFor="listingDeposit">Deposit</label>
                        <input type="text" name="listingDeposit" className="form-control" value={this.state.deposit} onChange={this.handleDepositChange.bind(this)} />
                        <br />
                        <label htmlFor="voteValue">Vote Value (only aye or nay)</label>
                        <input type="text" name="voteValue" className="form-control" value={this.state.voteVal} onChange={this.handleVoteValChange.bind(this)} />
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

export default VotePopup;