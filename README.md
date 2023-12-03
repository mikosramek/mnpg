# MNPG

MNPG is an Apollo wrapper library that interfaces with [prismic](prismic.io/). It stands for Miko's Neocities Prismic Grabber, as it was first used for my Neocities site, but has no affiliation with them other than in spirit.

## Usage

### Setup

1. Create a [prismic](prismic.io/) repo and grab the repo-name plus an access token.
2. Install the library with `npm i @mikosramek/mnpg`
3. Save your prismic schema to a `.json` file
4. Write your GraphQL queries for pages

### Schema Getting Example

This can be done through code, or through the graphql interface on Prismic's website. Having it as it's own file means that you can encorporate it into ci/cd rather than having to manually update a file.

```js
const { MNPG } = require("@mikosramek/mnpg");

const client = new MNPG("<repo-name>", "<secret-access-token>");

const pathToSchemaJSONFile = path.resolve(
  __dirname,
  "..",
  "schema",
  "schema.json"
);

const getSchema = async () => {
  await client.createFragments(pathToSchemaJSONFile);
};

getSchema();
```

### Code Example

#### Getting a single page

```js
const { MNPG } = require("@mikosramek/mnpg");
const schema = require("./schema/schema.json");

// Load in your GraphQL queries saved as text
const { basePages } = require("./queries");

client = new MNPG("<repo-name>", "<secret-access-token>");
client.createClient(schema);

// Use them to get index Data
const indexData = await client.getBasePages(basePages);
const index = _get(indexData, "<page-name>.edges[0].node", {});
```

#### Getting multiple paginated pages:

Define graphql, where `firstEntries` the does a basic query, and the `entries` allows for a paginated query

```js
const base = `
edges {
  cursor
  node {
      _meta {
          uid
          lastPublicationDate
          firstPublicationDate
      }
  }
}
`;
const firstEntries = `
{
    allPages (sortBy:meta_firstPublicationDate_ASC) {
        totalCount
        pageInfo {
            hasNextPage
        }
        ${base}
    }
}
`;

const entries = (lastId) => `
{
    allPages (after: "${lastId}", first: 20, sortBy:meta_firstPublicationDate_ASC) {
        totalCount
        pageInfo {
            hasNextPage
        }
        ${base}
    }
}
`;
```

Pass the two queries, alongside the entry type's name (`allPages`), and this will query entries until `hasNextPage` returns false.

```js
const pages = await client.getEntries(firstEntries, entries, "allPages");
```

## Built With

- `apollo-cache-inmemory`
- `apollo-client`
- `apollo-link-prismic`
- `axios`
- `graphql-tag`
- `lodash.get`

## Contributing

Not considering contributions at the moment.

## Authors

- Miko Sramek

## License

[MIT License](./LICENSE.md) © Miko Sramek
