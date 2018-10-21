import React from 'react'
import { Button, Icon, Item, Label } from 'semantic-ui-react'

const ListingItem = ({ name, hash, deposit, isWhitelisted, owner }) => (
    <Item>
        <Item.Image>
            <Icon name="database" size="huge"/>
        </Item.Image>

        <Item.Content>
            <Item.Header>{name}</Item.Header>
            <Item.Meta>
                <Label>{hash}</Label>
                <Label>{deposit}</Label>
                <Label>{owner}</Label>
            </Item.Meta>
            <Item.Description content={isWhitelisted}></Item.Description>
        </Item.Content>
    </Item>
)

const Listings = ({list}) => (
    <Item.Group divided>
        {list.map(item => <ListingItem key={item.name} {...item} />)}
    </Item.Group>
)

export default Listings