const MNPG = require("../dist/lib");

const test = () => {
  const client = new MNPG("miko-sramek", "");
  client.createFragments();
};

test();
