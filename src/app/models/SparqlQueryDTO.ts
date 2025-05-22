
export interface SparqlQueryDTO {
    query: string;
    format: string;
    timeout: number;
    clientQueryId: string;
}