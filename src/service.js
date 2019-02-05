const { ApiPromise } = require('@polkadot/api');
const { WsProvider } = require('@polkadot/rpc-provider');
const { Keyring } = require('@polkadot/keyring');
const { stringToU8a } = require('@polkadot/util');

// Initialise the websocket provider to connect to the Substrate node
const provider = new WsProvider(process.env.REACT_APP_SUBSTRATE_ADDR);

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

export async function getTcrDetails() {
    const api = await ApiPromise.create(provider);

    // Make our basic chain state/storage queries, all in one go
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

export async function getAllListings() {
    return [];
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

                    events.forEach(({ phase, event: { data, method, section } }) => {
                        console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                        // check if the tcr proposed event was emitted by Substrate runtime
                        if (section.toString() === "tcr" && method.toString() === "Proposed") {
                            // TODO: insert metadata in off-chain store
                            
                            // if yes, resolve with event data
                            resolve(data.toString());
                        }
                    });
                }
            })
            .catch(err => reject(err));
    });
}