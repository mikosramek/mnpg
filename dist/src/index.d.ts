declare const InMemoryCache: any;
declare const ApolloClient: any;
declare const gql: any;
declare const createPrismicLink: any;
declare const _get: any;
declare const axios: any;
declare const AxiosResponse: any;
declare const parts: any;
type Edges = Record<any, any>[];
type PaginatedQuery = (id: string) => string;
declare class MNPG {
    repo: string;
    accessToken: string;
    client: typeof ApolloClient;
    fragmentMatcher: string;
    constructor(repo: string, accessToken: string);
    createFragments(prismicRef: string): void;
    createClient(): void;
    private entryQuery;
    getEntries(firstEntriesQuery: string, paginatedQuery: PaginatedQuery): Promise<unknown>;
    getBasePages(basePagesQuery: string): Promise<unknown>;
}
