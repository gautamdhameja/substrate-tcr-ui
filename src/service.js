import Web3 from 'web3';

import tokenArtifact from './contracts/Token.json';
import tcrArtifact from './contracts/Tcr.json'

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_ETH_URL));

const tcrAddress = process.env.REACT_APP_TCR_ADDR;

export async function getTcrDetails() {
    const contract = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    return await contract.methods.getDetails().call();
}

export async function getAllListings() {
    const contract = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    const result = await contract.methods.getAllListings().call();
    const listings = [];
    if (result.length > 0) {
        result.forEach(async (item) => {
            const details = await contract.methods.getListingDetails(web3.utils.asciiToHex(item)).call();
            const listing = {
                name: details[4],
                owner: details[1],
                isWhitelisted: details[0],
                deposit: details[2]
            }
            listings.push(listing);
        });
    }
    return listings;
}

export async function applyListing(name, deposit) {
    const contracts = await setupContracts(tcrAddress);
    const dep = parseInt(deposit.toString());
    await contracts.token.methods.approve(tcrAddress, dep).send();
    const applyListing = await contracts.tcr.methods.apply(web3.utils.asciiToHex(name), dep, name).send();
    console.log(applyListing);
}

export async function challengeListing(name, deposit) {
    const contracts = await setupContracts(tcrAddress);
    const dep = parseInt(deposit.toString());
    await contracts.token.methods.approve(tcrAddress, dep).send();
    const challengeListing = await contracts.tcr.methods.challenge(web3.utils.asciiToHex(name), dep).send();
    console.log(challengeListing);
}

export async function resolveListing(name) {
    const contracts = await setupContracts(tcrAddress);
    const resolveListing = await contracts.tcr.methods.updateStatus(web3.utils.asciiToHex(name)).send();
    console.log(resolveListing);
}

async function setupContracts() {
    const tcr = new web3.eth.Contract(tcrArtifact.abi, tcrAddress);
    const tokenAddr = await tcr.methods.token().call();
    const token = new web3.eth.Contract(tokenArtifact.abi, tokenAddr);
    token.options.from = process.env.REACT_APP_ACC1;
    tcr.options.from = process.env.REACT_APP_ACC1;
    tcr.options.gas = 3000000;
    return { tcr, token };
}