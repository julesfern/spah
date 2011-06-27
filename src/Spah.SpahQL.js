/**
 * class Spah.SpahQL
 *
 * The SpahQL module wraps all operations relating to querying JSON objects, and manipulating data
 * based on their responses. SpahQL wraps a query parser with a matching set of query token types, a query runner
 * and the wrapping objects for query responses (QueryResultSet and QueryResult).
 *
 * The main SpahQL module also provides the frontend querying methods for all SpahQL operations. Use #select and #assert on this
 * class for all your querying needs.
 **/

Spah.SpahQL = Spah.classCreate("Spah.SpahQL", {
  
  /** 
   * Spah.SpahQL.select(query, rootData[,scopeData][,path]) -> QueryResultSet
   * - query (String): A valid SpahQL query. This may not be an assertion query.
   * - rootData (Object, Array): The root data context being queried.
   * - scopeData (Object, Array): The actual data context being queried, which should be a sub-context of the rootData.
   * - scopePath (String): Optional: If the data being queried is a member item of a larger queryable data construct, providing the path 
   *    for the queryable object will ensure that results are generated with an accurate path attribute.
   *
   * Executes a query against the given data construct and retrieves all objects that match the supplied query.
   **/
  "select": function(query, rootData, scopeData, scopePath) {
    var pQuery = this.QueryParser.parseQuery(query);
    if(pQuery.assertion) throw new this.SpahQLRunTimeError("Cannot call SpahQL.select() with an assertion query.");
    return new this.QueryResultSet(this.QueryRunner.select(pQuery, rootData, scopeData, scopePath));
  },
  
  /**
   * Spah.SpahQL.assert(query, data) -> Boolean
   * - query (String): A valid SpahQL query. This may not be an assertion query.
   * - rootData (Object, Array): The root data context being queried.
   * - scopeData (Object, Array): The actual data context being queried, which should be a sub-context of the rootData.
   * - scopePath (String): Optional: If the data being queried is a member item of a larger queryable data construct, providing the path 
   *    for the queryable object will ensure that results are generated with an accurate path attribute.
   *
   * Executes an assertion query and returns the appropriate boolean result.
   **/
  "assert": function(query, rootData, scopeData, scopePath) {
    var pQuery = this.QueryParser.parseQuery(query);
    return this.QueryRunner.assert(pQuery, rootData, scopeData, scopePath);
  }
  
});