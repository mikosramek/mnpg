"use strict";
var MNPG = require("../dist/lib");
var test = function () {
    var client = new MNPG("miko-sramek", "");
    client.createFragments();
};
test();
