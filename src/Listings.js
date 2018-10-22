import React from 'react'
import { Item, Label } from 'semantic-ui-react'

const ListingItem = ({ name, hash, challenge, isWhitelisted, owner }) => {
    return (<Item>
        <Item.Content>
            <Item.Header>Name: <b>{name}</b></Item.Header>
            <Item.Meta>
                <Label>Hex: <b>{hash.toString()}</b></Label>
                <Label>ChallengeID: <b>{challenge}</b></Label>
                <Label>Owner: <b>{owner}</b></Label>
            </Item.Meta>
        </Item.Content>
    </Item>)
}

const Listings = ({list}) => (
    <Item.Group divided>
        {list.map(item => <ListingItem key={item.name} {...item} />)}
    </Item.Group>
)

export default Listings