require("dotenv").config();
const { MNPG: testClient } = require("../dist/src");

const test = async () => {
  const client = new testClient(
    process.env.TEST_REPO,
    process.env.TEST_REPO_ACCESS_TOKEN
  );
  client.createClient();

  const home = await client.getBasePages(`{allHomes {
    edges {
      node {
        header_text
      }
    }
  }}`);

  console.log(home.allHomes.edges[0].node.header_text);
};

test();
