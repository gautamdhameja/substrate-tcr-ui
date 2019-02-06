import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap';

class ChallengePopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deposit: "",
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleDepositChange(event) {
        this.setState({ deposit: event.target.value });
    }

    handleSubmit() {
        this.props.submit(this.state.deposit);
    }

    render() {
        return (<div>
            <Modal isOpen={this.props.modal} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>{this.props.header}</ModalHeader>
                <ModalBody>
                    <div>
                        <label htmlFor="listingDeposit">Deposit</label>
                        <input type="text" name="listingDeposit" id="listingDeposit" className="form-control" value={this.state.deposit} onChange={this.handleDepositChange.bind(this)} />
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

export default ChallengePopup;