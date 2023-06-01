import { ApolloClient } from "@apollo/client/core";
export type Edges = Record<any, any>[];
export type PaginatedQuery = (id: string) => string;
export default class MNPG {
    repo: string;
    accessToken: string;
    client: ApolloClient<object> | null;
    constructor(repo: string, accessToken: string);
    private createClient;
    private entryQuery;
    getEntries(firstEntriesQuery: string, paginatedQuery: PaginatedQuery, entryName: string): Promise<unknown>;
    getBasePages(basePagesQuery: string): Promise<unknown>;
}
