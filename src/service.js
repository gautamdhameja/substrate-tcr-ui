const { ApiPromise } = require('@polkadot/api');
const { WsProvider } = require('@polkadot/rpc-provider');
const { Keyring } = require('@polkadot/keyring');
const { stringToU8a } = require('@polkadot/util');
const dataService = require('./dataService');

// Initialise the websocket provider to connect to the Substrate node
const provider = new WsProvider(process.env.REACT_APP_SUBSTRATE_ADDR);

// connects to the substrate node
export async function connect() {
    const api = await ApiPromise.create(provider);

    // Retrieve the chain & node information information via rpc calls
    const [chain, name, version] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);

    const connected = `You are connected to chain ${chain} using ${name} v${version}`;
    console.log(connected);
    return { chain, name, version };
}

// gets TCR parameters from the chain storage
export async function getTcrDetails() {
    const api = await ApiPromise.create(provider);

    const [asl, csl, md] = await Promise.all([
        api.query.tcr.applyStageLen(),
        api.query.tcr.commitStageLen(),
        api.query.tcr.minDeposit()
    ]);

    // the Moment type is returned as the full Date object
    // converting it to seconds
    const aslSeconds = Math.floor(new Date(asl).getTime() / 1000);
    const cslSeconds = Math.floor(new Date(csl).getTime() / 1000);

    // converting the Balance type to value string
    const mdTokens = JSON.stringify(md);

    return { aslSeconds, cslSeconds, mdTokens };
}

// gets all listings from the off-chain storage
export async function getAllListings() {
    return dataService.getAllListings();
}

// apply for a new listing
export async function applyListing(seed, name, deposit) {
    return new Promise(async (resolve, reject) => {
        // create an API promise object
        const api = await ApiPromise.create();

        // add keypair from the seed to the keyring
        const keyring = new Keyring();
        const paddedSeed = seed.padEnd(32);
        const keys = keyring.addFromSeed(stringToU8a(paddedSeed));

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .propose(name, deposit)
            // Sign and send the transcation
            .signAndSend(keys, ({ events = [], status, type }) => {

                if (type === 'Finalised') {
                    console.log('Completed at block hash', status.asFinalised.toHex());

                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                        // check if the tcr proposed event was emitted by Substrate runtime
                        if (section.toString() === "tcr" && method.toString() === "Proposed") {
                            // insert metadata in off-chain store
                            const datajson = JSON.parse(data.toString());
                            const listingInstance = {
                                name: name,
                                hash: datajson[1],
                                owner: datajson[0],
                                deposit: datajson[2],
                                isWhitelisted: false
                            }
                            await dataService.insertListing(listingInstance);

                            // resolve the promise with listing data
                            resolve(listingInstance);
                        }
                    });
                }
            })
            .catch(err => reject(err));
    });
}

// gets the token balance for an account
// this is the TCR token balance and not the Substrate balances module balance
export async function getBalance(seed) {
    const keyring = new Keyring();
    const paddedSeed = seed.padEnd(32);
    const keys = keyring.addFromSeed(stringToU8a(paddedSeed));

    const api = await ApiPromise.create();
    const balance = await api.query.token.balanceOf(keys.address());

    return JSON.stringify(balance);
}

// challenge a listing
export async function challengeListing(hash, deposit) {
    return new Promise(async (resolve, reject) => {
        // create an API promise object
        const api = await ApiPromise.create();

        // add keypair from the seed to the keyring
        const seed = localStorage.getItem("seed");
        const keyring = new Keyring();
        const paddedSeed = seed.padEnd(32);
        const keys = keyring.addFromSeed(stringToU8a(paddedSeed));

        // TODO: fix type cast
        const listing = await api.query.tcr.listings(hash);

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .challenge(listing.id, deposit)
            // Sign and send the transcation
            .signAndSend(keys, ({ events = [], status, type }) => {
                if (type === 'Finalised') {
                    console.log('Completed at block hash', status.asFinalised.toHex());
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                        // check if the tcr proposed event was emitted by Substrate runtime
                        if (section.toString() === "tcr" && method.toString() === "Challenged") {
                            const datajson = JSON.parse(data.toString());
                            // resolve the promise with challenge data
                            resolve(datajson);
                        }
                    });
                }
            })
            .catch(err => reject(err));
    });
}

// vote on a challenged listing
export async function voteListing(hash, deposit) {
    console.log(hash, deposit);
    return hash;
}

// resolve a listing
export async function resolveListing(hash) {
    return new Promise(async (resolve, reject) => {
        // create an API promise object
        const api = await ApiPromise.create();

        // add keypair from the seed to the keyring
        const seed = localStorage.getItem("seed");
        const keyring = new Keyring();
        const paddedSeed = seed.padEnd(32);
        const keys = keyring.addFromSeed(stringToU8a(paddedSeed));

        // // TODO: fix type cast
        // const listing = await api.query.tcr.listings(hash);

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .resolve(0)
            // Sign and send the transcation
            .signAndSend(keys, ({ events = [], status, type }) => {
                if (type === 'Finalised') {
                    console.log('Completed at block hash', status.asFinalised.toHex());
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                        // check if the tcr proposed event was emitted by Substrate runtime
                        if (section.toString() === "tcr" && 
                            method.toString() === "Accepted") {
                            // if accepted, updated listing status
                            // TODO: fix this
                            const datajson = JSON.parse(data.toString());
                            const listing = dataService.getListing(hash);
                            listing.isWhitelisted = true;
                            dataService.updateListing(listing);
                            resolve(datajson);
                        }
                    });
                }
            })
            .catch(err => reject(err));
    });
}