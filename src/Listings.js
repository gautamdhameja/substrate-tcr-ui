import React from 'react'
import { Item, Label, Icon, Button } from 'semantic-ui-react'

const ListingItem = ({ name, hash, challenge, isWhitelisted, owner }) => {
    return (<Item>
        <Item.Image className='text-center' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: 50}}>
            <Icon name={ isWhitelisted? 'check circle outline' : 'circle outline' } size='big' />
        </Item.Image>
        <Item.Content>
            <Item.Header><b>{name}</b></Item.Header>
            <Item.Meta>
                <Label>Hex: <b>{hash.toString()}</b></Label>
                <Label>ChallengeID: <b>{challenge}</b></Label>
                <Label>Owner: <b>{owner}</b></Label>
            </Item.Meta>
            <Item.Extra>
                <Button basic color='green' size='mini' floated='right'>Resolve</Button>
                <Button basic color='blue' size='mini' floated='right'>Challenge</Button>
                <Button basic color='grey' size='mini' floated='right'>Vote</Button>
            </Item.Extra>
        </Item.Content>
    </Item>)
}

const Listings = ({list}) => (
    <Item.Group divided>
        {list.map(item => <ListingItem key={item.name} {...item} />)}
    </Item.Group>
)

export default Listings