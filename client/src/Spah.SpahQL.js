/**
 * class Spah.SpahQL
 *
 * The SpahQL module wraps all operations relating to querying JSON objects, and manipulating data
 * based on their responses. SpahQL wraps a query parser with a matching set of query token types, a query runner
 * and the wrapping objects for query responses (QueryResultSet and QueryResult).
 *
 * The main SpahQL module also provides the frontend 
 **/

Spah.SpahQL = Spah.classCreate("Spah.SpahQL", {
  
  /** 
   * Spah.SpahQL.select(query, data[, path]) -> QueryResultSet
   * - query (String): A valid SpahQL query. This may not be an assertion query.
   * - data (Object, Array): The data construct being queried.
   * - path (String): Optional: If the data being queried is a member item of a larger queryable data construct, providing the path 
   *    for the queryable object will ensure that results are generated with an accurate path attribute.
   *
   * Executes a query against the given data construct and retrieves all objects that match the supplied query.
   **/
  "select": function(query, data, path) {
    var pQuery = this.QueryParser.parseQuery(query);
    if(pQuery.assertion) throw new this.SpahQLRunTimeError("Cannot call SpahQL.select() with an assertion query.");
    return this.QueryRunner.select(pQuery, data, data, path);
  },
  
  /**
   * Spah.SpahQL.assert(query, data) -> Boolean
   * - query (String): A valid SpahQL query. This may not be an assertion query.
   * - data (Object, Array): The data construct being queried.
   *
   *
   **/
  "assert": function(query, data) {
    var pQuery = this.QueryParser.parseQuery(query);
    
  }
  
});