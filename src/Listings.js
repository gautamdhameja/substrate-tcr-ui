import React, { Component } from 'react';
import { Item, Label, Icon, Button } from 'semantic-ui-react';
import ChallengePopup from './modals/Challenge';

import * as service from './service';

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
        this.inProgress = true;
        service.challengeListing(this.props.hash, deposit)
            .then((result) => {
                this.inProgress = false;
                this.challengeToggle();
                console.log(result);
            });
    }

    vote(deposit) {
        this.inProgress = true;
        service.voteListing(this.props.hash, deposit)
            .then((result) => {
                this.inProgress = false;
                this.voteToggle();
                console.log(result);
            });
    }

    resolve() {
        service.resolveListing(this.props.hash)
            .then((result) => {
                this.inProgress = false;
                console.log(result);
            });
    }

    render() {
        const { name, deposit, isWhitelisted, owner, hash } = this.props;
        return (
            <Item>
                <ChallengePopup modal={this.state.modal} submit={this.challenge} toggle={this.challengeToggle} header={"Challenge Listing: " + name} inProgress={this.state.inProgress} />
                <ChallengePopup modal={this.state.voteModal} submit={this.vote} toggle={this.voteToggle} header={"Vote Listing: " + name} inProgress={this.state.inProgress} />
                <Item.Image className='text-center' style={{ display: 'inline', justifyContent: 'center', alignItems: 'center', maxWidth: 80 }}>
                    <Icon name={isWhitelisted ? 'check circle outline' : 'circle outline'} size='huge' />
                </Item.Image>
                <Item.Content>
                    <Item.Header>{name}</Item.Header>
                    <Item.Meta>
                        <b>Owner:</b> <Label>{owner}</Label>
                        <br /> <br />
                        <b>Hash:</b> <Label>{hash}</Label>
                        <b>Deposit:</b> <Label>{deposit}</Label>
                    </Item.Meta>
                    <Item.Extra>
                        <Button basic color='green' size='mini' floated='right' onClick={this.resolve}>Resolve</Button>
                        <Button basic color='purple' size='mini' floated='right' onClick={this.voteToggle}>Vote</Button>
                        <Button basic color='blue' size='mini' floated='right' onClick={this.challengeToggle}>Challenge</Button>
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