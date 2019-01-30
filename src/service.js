// Required imports
const { ApiPromise } = require('@polkadot/api');
const { WsProvider } = require('@polkadot/rpc-provider');

// Initialise the provider to connect to the local node
const provider = new WsProvider('ws://127.0.0.1:9944');

export async function main () {
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
    const api = await ApiPromise.create();

    // Make our basic chain state/storage queries, all in one go
    const [asl, csl, md] = await Promise.all([
        api.query.tcr.applyStageLen(),
        api.query.tcr.commitStageLen(),
        api.query.tcr.minDeposit()
    ]);
    
    const aslSeconds = Math.floor(new Date(asl).getTime() / 1000);
    const cslSeconds = Math.floor(new Date(csl).getTime() / 1000);
    const mdTokens = JSON.stringify(md);
    
    return { aslSeconds, cslSeconds, mdTokens };
}

export async function getAllListings() {
    return [];
}