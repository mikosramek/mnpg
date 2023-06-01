"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import {
//   InMemoryCache,
//   IntrospectionFragmentMatcher,
// } from "apollo-cache-inmemory";
const core_1 = require("@apollo/client/core");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const apollo_link_prismic_1 = require("apollo-link-prismic");
const lodash_get_1 = __importDefault(require("lodash.get"));
class MNPG {
    repo;
    accessToken;
    client;
    constructor(repo, accessToken) {
        this.repo = repo;
        this.accessToken = accessToken;
        this.client = null;
        this.createClient();
    }
    createClient() {
        const link = (0, apollo_link_prismic_1.createPrismicLink)({
            repositoryName: this.repo,
            accessToken: this.accessToken,
        });
        this.client = new core_1.ApolloClient({
            link: link,
            cache: new core_1.InMemoryCache(),
        });
    }
    entryQuery(firstEntriesQuery, paginatedQuery, entryName, edges = []) {
        console.log(firstEntriesQuery);
        return new Promise((resolve, reject) => {
            if (!this.client)
                return reject(new Error("No client created."));
            this.client
                .query({
                query: (0, graphql_tag_1.default) `
            ${firstEntriesQuery}
          `,
            })
                .then((response) => {
                const newEdges = (0, lodash_get_1.default)(response, `data.${entryName}.edges`, []);
                edges.push(...newEdges);
                const hasNextPage = (0, lodash_get_1.default)(response, `data.${entryName}.pageInfo.hasNextPage`, false);
                const lastEntryCursor = (0, lodash_get_1.default)(newEdges[newEdges.length - 1], "cursor");
                console.log({
                    hasNextPage,
                    lastEntryCursor,
                    q: paginatedQuery(lastEntryCursor),
                });
                if (hasNextPage) {
                    resolve(this.entryQuery(paginatedQuery(lastEntryCursor), paginatedQuery, entryName, edges));
                }
                else {
                    resolve(edges);
                }
            })
                .catch(reject);
        });
    }
    getEntries(firstEntriesQuery, paginatedQuery, entryName) {
        return new Promise(async (resolve, reject) => {
            try {
                const edges = await this.entryQuery(firstEntriesQuery, paginatedQuery, entryName);
                resolve(edges);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getBasePages(basePagesQuery) {
        return new Promise((resolve, reject) => {
            if (!this.client)
                return reject(new Error("No client created."));
            this.client
                .query({
                query: (0, graphql_tag_1.default) `
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
exports.default = MNPG;
