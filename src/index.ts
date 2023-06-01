import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import gql from "graphql-tag";
import { createPrismicLink } from "apollo-link-prismic";
import _get from "lodash.get";

export type Edges = Record<any, any>[];
export type PaginatedQuery = (id: string) => string;

export default class MNPG {
  repo: string;
  accessToken: string;
  client: ApolloClient<object> | null;

  constructor(repo: string, accessToken: string) {
    this.repo = repo;
    this.accessToken = accessToken;
    this.client = null;
    this.createClient();
  }

  private createClient() {
    const link = createPrismicLink({
      repositoryName: this.repo,
      accessToken: this.accessToken,
    });
    this.client = new ApolloClient({
      link: link,
      cache: new InMemoryCache(),
    });
  }

  private entryQuery(
    firstEntriesQuery: string,
    paginatedQuery: PaginatedQuery,
    entryName: string,
    edges: Edges = []
  ) {
    console.log(firstEntriesQuery);
    return new Promise((resolve, reject) => {
      if (!this.client) return reject(new Error("No client created."));
      this.client
        .query({
          query: gql`
            ${firstEntriesQuery}
          `,
        })
        .then((response) => {
          const newEdges = _get(
            response,
            `data.${entryName}.edges`,
            []
          ) as Edges;
          edges.push(...newEdges);
          const hasNextPage = _get(
            response,
            `data.${entryName}.pageInfo.hasNextPage`,
            false
          );
          const lastEntryCursor = _get(newEdges[newEdges.length - 1], "cursor");
          console.log({
            hasNextPage,
            lastEntryCursor,
            q: paginatedQuery(lastEntryCursor),
          });
          if (hasNextPage) {
            resolve(
              this.entryQuery(
                paginatedQuery(lastEntryCursor),
                paginatedQuery,
                entryName,
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

  getEntries(
    firstEntriesQuery: string,
    paginatedQuery: PaginatedQuery,
    entryName: string
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const edges = await this.entryQuery(
          firstEntriesQuery,
          paginatedQuery,
          entryName
        );
        resolve(edges);
      } catch (e) {
        reject(e);
      }
    });
  }

  getBasePages(basePagesQuery: string) {
    return new Promise((resolve, reject) => {
      if (!this.client) return reject(new Error("No client created."));
      this.client
        .query({
          query: gql`
            ${basePagesQuery}
          `,
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch(reject);
    });
  }
}
