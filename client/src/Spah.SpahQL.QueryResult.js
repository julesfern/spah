/**
 * class Spah.SpahQL.QueryResult
 *
 * A simple model wrapping an individual result returned from a SpahQL query.
 **/
 
/**
 * new Spah.SpahQL.QueryResult(path, value)
 *
 * Creates a new instance with the specified path and value.
 **/
Spah.SpahQL.QueryResult = function(path, value) { this.path = path; this.value = value; };
window["Spah"]["SpahQL"]["QueryResult"] = Spah.SpahQL.QueryResult;

Spah.SpahQL.QueryResult.prototype = {
  
  /**
   * Spah.SpahQL.QueryResult#path -> String path or null
   * 
   * The SpahQL object path from which this result was garnered, if it was gathered from an object path.
   * Results garnered from literals will not have paths associated with them.
   **/
  "path": null,
  
  /**
   * Spah.SpahQL.QueryResult#value -> Array, object, boolean, string or null
   * 
   * The raw value of this query result as represented in the queried object.
   **/
  "value": null
  
};