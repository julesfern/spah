/**
 * class Spah.SpahQL.QueryRunner
 *
 * Class responsible for executing parsed <code>Spah.SpahQL.Query</code> queries and returning sets
 * of <code>Spah.SpahQL.QueryResult</code> instances.
 **/
Spah.SpahQL.QueryRunner = function() {};
window["Spah"]["SpahQL"]["QueryRunner"] = Spah.SpahQL.QueryRunner;

// Singletons
jQuery.extend(Spah.SpahQL.QueryRunner, {
  
  /**
   * Spah.SpahQL.QueryRunner.select(query, data) -> Array resultset
   * - query (Spah.SpahQL.Query): A parsed query instance
   * - data (Object): The data against which to run the query
   *
   * Executes a selection query against the given dataset. Returns an array of result instances.
   **/
  "select": function(query, data) {
    
  },
  
  /**
   * Spah.SpahQL.QueryRunner.assert(query, data) -> Boolean result
   * - query (Spah.SpahQL.Query): A parsed query instance
   * - data (Object): The data against which to run the query
   *
   * Executes and ssserts the truthiness of a selection or assertion query against the given dataset. 
   * Returns a boolean indicating the overall result of the query - if the query is not an assertion
   * query, it will return true if the query returns one or more results.
   **/
  "assert": function(query, data) {
    
  }
  
})