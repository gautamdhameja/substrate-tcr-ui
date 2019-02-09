import React, { Component } from 'react';
import { Item, Icon, Button } from 'semantic-ui-react';
import ChallengePopup from '../modals/Challenge';
import VotePopup from '../modals/Vote';

import * as service from '../services/tcrService';

class ListingItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            voteModal: false,
            inProgress: false
        };

        this.challenge = this.challenge.bind(this);
        this.resolve = this.resolve.bind(this);
        this.vote = this.vote.bind(this);
        this.claim = this.claim.bind(this);
        this.challengeToggle = this.challengeToggle.bind(this);
        this.voteToggle = this.voteToggle.bind(this);
    }

    challengeToggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    voteToggle() {
        this.setState({
            voteModal: !this.state.voteModal
        });
    }

    challenge(deposit) {
        this.setState({ inProgress: true });
        service.challengeListing(this.props.hash, deposit)
            .then((result) => {
                this.setState({ inProgress: false });
                this.challengeToggle();
                console.log(result);
            }).catch((err) => {
                alert(err.message);
            });;
    }

    vote(voteVal, deposit) {
        this.setState({ inProgress: true });
        service.voteListing(this.props.hash, voteVal, deposit)
            .then((result) => {
                this.setState({ inProgress: false });
                this.voteToggle();
                console.log(result);
            }).catch((err) => {
                alert(err.message);
            });
    }

    resolve() {
        service.resolveListing(this.props.hash)
            .then((result) => {
                console.log(result);
            }).catch((err) => {
                alert(err.message);
            });;
    }

    claim() {
        service.claimReward(this.props.challengeId)
            .then((result) => {
                console.log(result);
            }).catch((err) => {
                alert(err.message);
            });;
    }

    getIcon(isWhitelisted, rejected) {
        if (!isWhitelisted && rejected) {
            return 'times circle outline';
        }

        if (isWhitelisted && !rejected) {
            return 'check circle outline';
        }

        return 'question circle outline';
    }

    getColor(isWhitelisted, rejected, challengeId) {
        if (challengeId > 0) {
            return 'brown';
        }

        if (isWhitelisted && !rejected) {
            return 'green';
        }

        if (!isWhitelisted && rejected) {
            return 'red';
        }

        return 'blue';
    }

    render() {
        const { name, deposit, isWhitelisted, owner, hash, challengeId, rejected } = this.props;        
        return (
            <Item>
                <ChallengePopup modal={this.state.modal} submit={this.challenge} toggle={this.challengeToggle} header={"Challenge Listing: " + name} inProgress={this.state.inProgress} />
                <VotePopup modal={this.state.voteModal} submit={this.vote} toggle={this.voteToggle} header={"Vote Listing: " + name} inProgress={this.state.inProgress} />
                <Item.Image className='text-center' style={{ display: 'inline', justifyContent: 'center', alignItems: 'center', maxWidth: 80 }}>
                    <Icon name={this.getIcon(isWhitelisted, rejected)} basic color={this.getColor(isWhitelisted, rejected, challengeId)} size='huge' />
                </Item.Image>
                <Item.Content>
                    <Item.Header>
                        <span>{name}</span>
                    </Item.Header>
                    <Item.Description>
                        <b>Owner:</b> {owner}
                        <br />
                        <b>Hash:</b> {hash}
                        <br />
                        <b>Deposit:</b> {deposit}
                    </Item.Description>
                    <Item.Extra>
                        {(isWhitelisted || rejected) && challengeId > 0 &&
                            <Button basic color='brown' size='mini' floated='right' onClick={this.claim}>Claim Reward</Button>}
                        {!isWhitelisted && !rejected &&
                        <Button basic color='green' size='mini' floated='right' onClick={this.resolve}>Resolve</Button>}
                        {(isWhitelisted && !rejected) && (!isWhitelisted && rejected) &&
                            <Button basic color='blue' size='mini' floated='right' onClick={this.voteToggle}>Vote</Button>}
                        {!isWhitelisted && !rejected && challengeId === 0 &&
                            <Button basic color='red' size='mini' floated='right' onClick={this.challengeToggle}>Challenge</Button>}
                    </Item.Extra>
                </Item.Content>
            </Item>
        )
    }
}

const Listings = ({ list }) => (
    <Item.Group divided>
        {list.map(item => <ListingItem key={item.name} {...item} />)}
    </Item.Group>
) 

export default Listings