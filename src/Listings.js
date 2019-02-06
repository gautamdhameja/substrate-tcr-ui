import React, { Component } from 'react';
import { Item, Label, Icon, Button } from 'semantic-ui-react';

import * as service from './service';

class ListingItem extends Component {
    constructor(props) {
        super(props);
    }

    async challenge(hash, deposit) {
        // await service.challengeListing(hash, deposit);
    }

    async resolve(name) {
        // await service.resolveListing(name);
    }

    render() {
        const { name, deposit, isWhitelisted, owner, hash } = this.props;
        return (<Item>
            <Item.Image className='text-center' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: 80}}>
                <Icon name={ isWhitelisted? 'check circle outline' : 'circle outline' } size='huge' />
            </Item.Image>
            <Item.Content>
                <Item.Header>{name}</Item.Header>
                <Item.Meta>
                    <b>Owner:</b> <Label>{owner}</Label>
                    <br/> <br/>
                    <b>Hash:</b> <Label>{hash}</Label>
                    <b>Deposit:</b> <Label>{deposit}</Label>
                </Item.Meta>
                <Item.Extra>
                    <Button basic color='green' size='mini' floated='right' onClick={async () => this.resolve(hash)}>Resolve</Button>
                    <Button basic color='blue' size='mini' floated='right' onClick={async () => this.challenge(hash, deposit)}>Challenge</Button>
                    <Button basic color='grey' size='mini' floated='right'>Vote</Button>
                </Item.Extra>
            </Item.Content>
        </Item>)
    }
}

const Listings = ({list}) => (
    <Item.Group divided>
        {list.map(item => <ListingItem key={item.name} {...item} />)}
    </Item.Group>
)

export default Listings