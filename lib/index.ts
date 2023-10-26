"use strict";

import { AxiosResponse } from "../node_modules/axios/index";

const {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} = require("apollo-cache-inmemory");
const ApolloClient = require("apollo-client").ApolloClient;
const gql = require("graphql-tag");
const PrismicLink = require("apollo-link-prismic").PrismicLink;
const _get = require("lodash.get");
const axios = require("axios");

const parts = require("./parts");

// const introspectionQueryResultData = require("./schema/fragmentTypes.json");
// const fragmentMatcher = new IntrospectionFragmentMatcher({
//   introspectionQueryResultData,
// });

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

  createFragments(prismicRef: string) {
    const URL = parts.queryFragments(this.repo);
    axios
      .get(URL, { Headers: { "Prismic-Ref": prismicRef } })
      .then(console.log)
      .error(console.error);
    this.fragmentMatcher = "";
  }

  createClient() {
    this.client = new ApolloClient({
      link: PrismicLink({
        uri: `https://${this.repo}.cdn.prismic.io/graphql`,
        accessToken: this.accessToken,
      }),
      cache: new InMemoryCache({ fragmentMatcher: this.fragmentMatcher }),
    });
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
        .then((response: AxiosResponse) => {
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
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch(reject);
    });
  }
}

module.exports = {
  MNPG,
};
