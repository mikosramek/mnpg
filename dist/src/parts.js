"use strict";
var schemaQuery = "\n{\n  __schema {\n    types {\n      kind\n      name\n      possibleTypes {\n        name \n      }\n    }\n  }\n}\n";
module.exports = {
    schemaQuery: schemaQuery,
};
