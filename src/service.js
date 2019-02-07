const { ApiPromise } = require('@polkadot/api');
const { WsProvider } = require('@polkadot/rpc-provider');
const { Keyring } = require('@polkadot/keyring');
const { stringToU8a } = require('@polkadot/util');
const dataService = require('./dataService');

// Initialise the websocket provider to connect to the Substrate node
const wsProvider = new WsProvider(process.env.REACT_APP_SUBSTRATE_ADDR);

// connects to the substrate node
export async function connect() {
    const api = await ApiPromise.create(wsProvider);

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
    const api = await ApiPromise.create(wsProvider);

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
export async function applyListing(name, deposit) {
    return new Promise(async (resolve, reject) => {
        const api = await ApiPromise.create();
        const keys = _getKeysFromSeed();

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
                                isWhitelisted: false,
                                challengeId: 0
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
    const keys = _getKeysFromSeed(seed);
    const api = await ApiPromise.create();
    const balance = await api.query.token.balanceOf(keys.address());
    return JSON.stringify(balance);
}

// challenge a listing
export async function challengeListing(hash, deposit) {
    return new Promise(async (resolve, reject) => {
        const api = await _createApiWithTypes();
        const keys = _getKeysFromSeed();

        const listing = await api.query.tcr.listings(hash);
        const listingJson = JSON.parse(listing.toString());

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .challenge(listingJson.id, deposit)
            // Sign and send the transcation
            .signAndSend(keys, ({ events = [], status, type }) => {
                if (type === 'Finalised') {
                    console.log('Completed at block hash', status.asFinalised.toHex());
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                        // check if the tcr proposed event was emitted by Substrate runtime
                        if (section.toString() === "tcr" && method.toString() === "Challenged") {
                            const datajson = JSON.parse(data.toString());
                            // update local listing with challenge id
                            const localListing = dataService.getListing(hash);
                            localListing.challengeId = datajson[2];
                            dataService.updateListing(localListing);
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
export async function voteListing(hash, voteValue, deposit) {
    return new Promise(async (resolve, reject) => {
        const api = await _createApiWithTypes();
        const keys = _getKeysFromSeed();

        const listing = await api.query.tcr.listings(hash);
        const listingJson = JSON.parse(listing.toString());

        // check if listing is currently challenged
        if (listingJson.challenge_id > 0) {
            // create, sign and send transaction
            api.tx.tcr
                // create transaction
                .vote(listingJson.challenge_id, voteValue, deposit)
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
                                const datajson = JSON.parse(data.toString());
                                const localListing = dataService.getListing(hash);
                                localListing.isWhitelisted = true;
                                localListing.challengeId = 0;
                                dataService.updateListing(localListing);
                                // resolve with event data
                                resolve(datajson);
                            }
                        });
                    }
                })
                .catch(err => reject(err));
        } else {
            reject(new Error("Listing is not currently challenged."));
        }
    });
}

// resolve a listing
export async function resolveListing(hash) {
    return new Promise(async (resolve, reject) => {
        const api = await _createApiWithTypes();
        const keys = _getKeysFromSeed();

        const listing = await api.query.tcr.listings(hash);
        const listingJson = JSON.parse(listing.toString());

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .resolve(listingJson.id)
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
                            const datajson = JSON.parse(data.toString());
                            const localListing = dataService.getListing(hash);
                            localListing.isWhitelisted = true;
                            localListing.challengeId = 0;
                            dataService.updateListing(localListing);
                            // resolve with event data
                            resolve(datajson);
                        }
                    });
                }
            })
            .catch(err => reject(err));
    });
}

// create an API promise object with custom types
async function _createApiWithTypes() {
    return await ApiPromise.create({
        types: {
            Listing: {
                "id": "u32",
                "data": "Vec<u8>",
                "deposit": "Balance",
                "owner": "AccountId",
                "application_expiry": "Moment",
                "whitelisted": "bool",
                "challenge_id": "u32"
            },
            Challenge: {
                "listing_hash": "Hash",
                "deposit": "Balance",
                "owner": "AccountId",
                "voting_ends": "Moment",
                "resolved": "bool",
                "reward_pool": "Balance",
                "total_tokens": "Balance"
            },
            Poll: {
                "listing_hash": "Hash",
                "votes_for": "Balance",
                "votes_against": "Balance",
                "passed": "bool"
            },
            Vote: {
                "value": "bool",
                "deposit": "Balance",
                "claimed": "bool"
            }
        }
    });
}

// get keypair from passed or locally stored seed
function _getKeysFromSeed(seed) {
    let _seed = seed;
    if(!seed) {
        _seed = localStorage.getItem("seed");
    }

    if(!_seed) {
        throw new Error("Seed not found.");
    }

    const keyring = new Keyring();
    const paddedSeed = _seed.padEnd(32);
    return keyring.addFromSeed(stringToU8a(paddedSeed));
}