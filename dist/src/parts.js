"use strict";
var queryFragments = function (repo) {
    return "https://".concat(repo, ".prismic.io/graphql?query=%7B%0A%20%20__schema%20%7B%0A%20%20%20%20types%20%7B%0A%20%20%20%20%20%20kind%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20possibleTypes%20%7B%0A%20%20%20%20%20%20%20%20name%20%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D");
};
module.exports = {
    queryFragments: queryFragments,
};
