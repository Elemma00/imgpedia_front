/**
 * This is the interface for the result of a SPARQL query.
 */
export interface SparqlResult {
    head: {
      vars: string[];
    };
    results: {
      bindings: {
        [key: string]: {
          type: string;
          value: string;
          datatype?: string;
        };
      }[];
    };
  }