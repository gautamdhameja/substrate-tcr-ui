import Web3 from 'web3';

import tokenArtifact from './contracts/Token.json';
import tcrArtifact from './contracts/Tcr.json'

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_ETH_URL));

export async function getAllListings(tcrAddress) {
    const contract = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    const result = await contract.methods.getAllListings().call();
    console.log(result);
}

export async function applyListing(tcrAddress) {
    const contract = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    const tokenAddr = await contract.methods.token().call();
    const token = new web3.eth.Contract(tokenArtifact.abi, tokenAddr);
    token.options.from = '0x85d5649E89166BE2D26317A8546Bc2d4CBB6E271'; 
    contract.options.from = '0x85d5649E89166BE2D26317A8546Bc2d4CBB6E271';
    contract.options.gas = 3000000;
    
    await token.methods.approve(tcrAddress, 100).send();
    const applyListing = await contract.methods.apply(web3.utils.asciiToHex("DemoListing"), 100, "DemoListing").send();
    console.log(applyListing);
}