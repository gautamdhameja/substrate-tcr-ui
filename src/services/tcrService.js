const { ApiPromise } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { stringToU8a } = require('@polkadot/util');
const dataService = require('./dataService');

// connects to the substrate node
export async function connect() {
    const api = await _createApiWithTypes();

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
    const api = await _createApiWithTypes();

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
    console.log(aslSeconds, cslSeconds, mdTokens);
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
        const nonce = await api.query.system.accountNonce(keys.address);
        console.log('Sending...', name, deposit);
        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .propose(name, deposit)
            // Sign and send the transcation
            .sign(keys, { nonce })
            .send(({ events = [], status }) => {
                if (status.isFinalized) {
                    console.log(status.asFinalized.toHex());
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                        // check if the tcr proposed event was emitted by Substrate runtime
                        if (section.toString() === "tcr" && method.toString() === "Proposed") {
                            // insert metadata in off-chain store
                            const datajson = JSON.parse(data.toString());
                            const listingInstance = {
                                name: name,
                                owner: datajson[0],
                                hash: datajson[1],
                                deposit: datajson[2],
                                isWhitelisted: false,
                                challengeId: 0,
                                rejected: false
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
export async function getBalance(seed, callback) {
    const keys = _getKeysFromSeed(seed);
    const api = await ApiPromise.create();
    api.query.token.balanceOf(keys.address, (balance) => {
        let bal = JSON.stringify(balance);
        callback(bal);
    });
}

// challenge a listing
export async function challengeListing(hash, deposit) {
    return new Promise(async (resolve, reject) => {
        const api = await _createApiWithTypes();
        const keys = _getKeysFromSeed();
        const nonce = await api.query.system.accountNonce(keys.address);

        const listing = await api.query.tcr.listings(hash);
        const listingJson = JSON.parse(listing.toString());

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .challenge(listingJson.id, deposit)
            .sign(keys, { nonce })
            .send(({ events = [], status }) => {
                if (status.isFinalized) {
                    console.log(status.asFinalized.toHex());
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        // check if the tcr proposed event was emitted by Substrate runtime
                        if (section.toString() === "tcr" && method.toString() === "Challenged") {
                            const datajson = JSON.parse(data.toString());
                            // update local listing with challenge id
                            const localListing = dataService.getListing(hash);
                            localListing.challengeId = datajson[2];
                            dataService.updateListing(localListing);
                            // resolve the promise with challenge data
                            resolve({
                                tx: status.asFinalized.toHex(),
                                data: datajson
                            });
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
        const nonce = await api.query.system.accountNonce(keys.address);

        const listing = await api.query.tcr.listings(hash);
        const listingJson = JSON.parse(listing.toString());

        // check if listing is currently challenged
        if (listingJson.challenge_id > 0) {
            // create, sign and send transaction
            api.tx.tcr
                // create transaction
                .vote(listingJson.challenge_id, voteValue, deposit)
                .sign(keys, { nonce })
                .send(({ events = [], status }) => {
                    if (status.isFinalized) {
                        console.log(status.asFinalized.toHex());
                        events.forEach(async ({ phase, event: { data, method, section } }) => {
                            // check if the tcr proposed event was emitted by Substrate runtime
                            if (section.toString() === "tcr" &&
                                method.toString() === "Voted") {
                                const datajson = JSON.parse(data.toString());
                                // resolve with event data
                                resolve({
                                    tx: status.asFinalized.toHex(),
                                    data: datajson
                                });
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
        const nonce = await api.query.system.accountNonce(keys.address);

        const listing = await api.query.tcr.listings(hash);
        const listingJson = JSON.parse(listing.toString());

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .resolve(listingJson.id)
            .sign(keys, { nonce })
            .send(({ events = [], status }) => {
                if (status.isFinalized) {
                    console.log(status.asFinalized.toHex());
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        if (section.toString() === "tcr" &&
                            method.toString() === "Accepted") {
                            // if accepted, updated listing status
                            const datajson = JSON.parse(data.toString());
                            const localListing = dataService.getListing(hash);
                            localListing.isWhitelisted = true;
                            dataService.updateListing(localListing);
                            // resolve with event data
                            resolve({
                                tx: status.asFinalized.toHex(),
                                data: datajson
                            });
                        }

                        if (section.toString() === "tcr" &&
                            method.toString() === "Rejected") {
                            // if accepted, updated listing status
                            const datajson = JSON.parse(data.toString());
                            const localListing = dataService.getListing(hash);
                            localListing.rejected = true;
                            dataService.updateListing(localListing);
                            // resolve with event data
                            resolve({
                                tx: status.asFinalized.toHex(),
                                data: datajson
                            });
                        }
                    });
                }
            })
            .catch(err => reject(err));
    });
}

// claim reward for a resolved challenge
export async function claimReward(challengeId) {
    return new Promise(async (resolve, reject) => {
        const api = await _createApiWithTypes();
        const keys = _getKeysFromSeed();
        const nonce = await api.query.system.accountNonce(keys.address);

        // create, sign and send transaction
        api.tx.tcr
            // create transaction
            .claimReward(challengeId)
            .sign(keys, { nonce })
            .send(({ events = [], status }) => {
                if (status.isFinalized) {
                    console.log(status.asFinalized.toHex());
                    events.forEach(async ({ phase, event: { data, method, section } }) => {
                        if (section.toString() === "tcr" &&
                            method.toString() === "Claimed") {
                            const datajson = JSON.parse(data.toString());
                            // resolve with event data
                            resolve({
                                tx: status.asFinalized.toHex(),
                                data: datajson
                            });
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
            },
            TokenBalance: "u128"
        }
    });
}

// get keypair from passed or locally stored seed
function _getKeysFromSeed(seed) {
    let _seed = seed;
    if (!seed) {
        _seed = localStorage.getItem("seed");
    }

    if (!_seed) {
        throw new Error("Seed not found.");
    }

    const keyring = new Keyring({ type: 'sr25519' });
    const paddedSeed = _seed.padEnd(32);
    return keyring.addFromSeed(stringToU8a(paddedSeed));
}