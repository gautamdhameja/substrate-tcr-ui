// wrapper for localstorage
// builds an off-chain storage based on runtime events
// a database backend should be used in real scenarios

// insert a listing object in the local storage
export async function insertListing(listing) {
    const listings = JSON.parse(localStorage.getItem("listings"));
    listings.push(listing);
    localStorage.setItem("listings", JSON.stringify(listings));
}

// get all listings from the local storage
// on first call, initializes with an empty array
export async function getAllListings() {
    const listings = localStorage.getItem("listings");
    if (listings) {
        return JSON.parse(listings);
    } else {
        localStorage.setItem("listings", JSON.stringify([]));
    }
}

// update a listing object in local storage
// replaces if the object is found with same listing hash
export function updateListing(listing) {
    const listings = JSON.parse(localStorage.getItem("listings"));
    const index = listings.findIndex(function (e) { return e.hash === listing.hash });
    if (index > -1) {
        listings.splice(index, 1, listing)
    }
    localStorage.setItem("listings", JSON.stringify(listings));
}

// get an item from the listings storage
export function getListing(hash) {
    const listings = JSON.parse(localStorage.getItem("listings"));
    return listings.find(function(e) { return e.hash === hash });
}