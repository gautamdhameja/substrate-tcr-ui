import Web3 from 'web3';

import tokenArtifact from './contracts/Token.json';
import tcrArtifact from './contracts/Tcr.json'

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_ETH_URL));

export async function getTcrDetails(tcrAddress) {
    const contract = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    return await contract.methods.getDetails().call();
}

export async function getAllListings(tcrAddress) {
    const contract = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    const result = await contract.methods.getAllListings().call();
    const listings = [];
    if (result.length > 0) {
        result.forEach(async (item) => {
            const details = await contract.methods.getListingDetails(web3.utils.asciiToHex(item)).call();
            const listing = {
                name: details[3],
                owner: details[1],
                isWhitelisted: details[0],
                challenge: details[2],
                hash: web3.utils.asciiToHex(details[3])
            }
            listings.push(listing);
        });
    }
    return listings;
}

export async function applyListing(name, tcrAddress) {
    const contract = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    const tokenAddr = await contract.methods.token().call();
    const token = new web3.eth.Contract(tokenArtifact.abi, tokenAddr);
    token.options.from = process.env.REACT_APP_ACC1;
    contract.options.from = process.env.REACT_APP_ACC1;
    contract.options.gas = 3000000;

    await token.methods.approve(tcrAddress, 100).send();
    const applyListing = await contract.methods.apply(web3.utils.asciiToHex(name), 100, name).send();
    console.log(applyListing);
}