declare const InMemoryCache: any, IntrospectionFragmentMatcher: any;
declare const ApolloClient: any;
declare const gql: any;
declare const createPrismicLink: any;
declare const _get: any;
declare const axios: any;
declare const AxiosResponse: any;
declare const fs: any;
declare const parts: any;
type Edges = Record<any, any>[];
type PaginatedQuery = (id: string) => string;
declare class MNPG {
    repo: string;
    accessToken: string;
    client: typeof ApolloClient;
    fragmentMatcher: string;
    constructor(repo: string, accessToken: string);
    createFragments(filePath: string): Promise<unknown>;
    createClient(introspectionQueryResultData?: null): void;
    private entryQuery;
    getEntries(firstEntriesQuery: string, paginatedQuery: PaginatedQuery, entryName: string): Promise<unknown>;
    getBasePages(basePagesQuery: string): Promise<unknown>;
}
