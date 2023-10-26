"use strict";

const {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} = require("apollo-cache-inmemory");
const ApolloClient = require("apollo-client").ApolloClient;
const gql = require("graphql-tag");
const { createPrismicLink } = require("apollo-link-prismic");
const _get = require("lodash.get");
const axios = require("axios");
const { AxiosResponse } = require("axios");
const fs = require("fs");

const parts = require("./parts");

type Edges = Record<any, any>[];
type PaginatedQuery = (id: string) => string;

class MNPG {
  repo: string;
  accessToken: string;
  client: typeof ApolloClient;
  fragmentMatcher: string;
  constructor(repo: string, accessToken: string) {
    this.repo = repo;
    this.accessToken = accessToken;
    this.fragmentMatcher = "";
  }

  createFragments(filePath: string) {
    const tempClient = new ApolloClient({
      link: createPrismicLink({
        repositoryName: this.repo,
        accessToken: this.accessToken,
      }),
      cache: new InMemoryCache(),
    });

    return new Promise((resolve, reject) => {
      tempClient
        .query({
          query: gql`
            ${parts.schemaQuery}
          `,
        })
        .then((response: typeof AxiosResponse) => {
          const data = JSON.stringify(response.data, null, 2);
          fs.writeFile(filePath, data, (err: Error) => {
            if (err) return reject(err);
            resolve(true);
          });
        })
        .catch(reject);
    });
  }

  createClient(introspectionQueryResultData = null) {
    if (introspectionQueryResultData) {
      const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData,
      });
      this.client = new ApolloClient({
        link: createPrismicLink({
          repositoryName: this.repo,
          accessToken: this.accessToken,
        }),
        cache: new InMemoryCache({ fragmentMatcher }),
      });
    } else {
      this.client = new ApolloClient({
        link: createPrismicLink({
          repositoryName: this.repo,
          accessToken: this.accessToken,
        }),
        cache: new InMemoryCache(),
      });
    }
  }

  private entryQuery(
    firstEntriesQuery: string,
    paginatedQuery: PaginatedQuery,
    edges: Edges = []
  ) {
    return new Promise((resolve, reject) => {
      this.client
        .query({
          query: gql`
            ${firstEntriesQuery}
          `,
        })
        .then((response: typeof AxiosResponse) => {
          const newEdges = _get(response, "data.allEntrys.edges", []) as Edges;
          edges.push(...newEdges);
          const hasNextPage = _get(
            response,
            "data.allEntrys.pageInfo.hasNextPage",
            false
          );
          const lastEntryCursor = _get(newEdges[newEdges.length - 1], "cursor");
          if (hasNextPage) {
            resolve(
              this.entryQuery(
                paginatedQuery(lastEntryCursor),
                paginatedQuery,
                edges
              )
            );
          } else {
            resolve(edges);
          }
        })
        .catch(reject);
    });
  }

  getEntries(firstEntriesQuery: string, paginatedQuery: PaginatedQuery) {
    return new Promise(async (resolve, reject) => {
      try {
        const edges = await this.entryQuery(firstEntriesQuery, paginatedQuery);
        resolve(edges);
      } catch (e) {
        reject(e);
      }
    });
  }

  getBasePages(basePagesQuery: string) {
    return new Promise((resolve, reject) => {
      this.client
        .query({
          query: gql`
            ${basePagesQuery}
          `,
        })
        .then((response: typeof AxiosResponse) => {
          resolve(response.data);
        })
        .catch(reject);
    });
  }
}

module.exports = {
  MNPG,
};
