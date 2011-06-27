/**
 * class Spah.SpahQL.QueryResult
 *
 * A simple model wrapping an individual result returned from a SpahQL query.
 **/
 

Spah.classCreate("Spah.SpahQL.QueryResult", {
  // Singletons
  // --------------------
},{
  
  // Instance
  // -------------------
  
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
  "value": null,
  
  /**
   * Spah.SpahQL.QueryResult#sourceData -> Object
   *
   * The data in which this query result was found.
   **/
  "sourceData": null,
  
  /**
   * new Spah.SpahQL.QueryResult(path, value, sourceData)
   *
   * Creates a new instance with the specified path and value.
   * The sourceData argument specifies the root data context in which this result was found.
   **/
  "init": function(path, value, sourceData) {
    this.path = path; 
    this.value = value; 
    this.sourceData = sourceData;
  },
  
  /**
   * Spah.SpahQL.QueryResult#parentPath() -> String or null
   * 
   * Returns the path for the object in the queried data which contains this result.
   * If this result is the root, the method will return null. If this result was
   * not produced by a path at all, but rather a set literal, range or other construct,
   * it will return null.
   **/
  "parentPath": function() {
    return (!this.path || this.path == "/")? null : this.path.substring(0, this.path.lastIndexOf("/"));
  },
  
  /**
   * Spah.SpahQL.QueryResult#parent() -> null, Spah.SpahQL.QueryResult
   *
   * Retrieves the parent object from the data construct that originally generated this
   * query result. Remember to always assume that the data may have been modified in the 
   * meantime.
   **/
  "parent": function() {
    var path = this.parentPath();
    return (path)? Spah.SpahQL.select(path, this.sourceData).first() : null;
  },
  
  /**
   * Spah.SpahQL.QueryResult#select(query) -> Spah.SpahQL.QueryResultSet
   *
   * Runs a selection query scoped to this result's path and data, and returns the results.
   * For instance:
   *
   *      select("/foo/foo").first().select("/foo") // Is exactly the same as just querying for /foo/foo/foo.
   **/
  "select": function(query) {
    return Spah.SpahQL.select(query, this.sourceData, this.value, this.path);
  },
  
  /**
   * Spah.SpahQL.QueryResult#assert(query) -> Spah.SpahQL.QueryResultSet
   *
   * Runs an assertion query scoped to this result's path and data, and returns the result. For instance:
   *
   *      select("/foo/foo").first().assert("/foo") // Is exactly the same as just asserting /foo/foo/foo.
   **/
  "assert": function(query) {
    return Spah.SpahQL.assert(query, this.sourceData, this.value, this.path);
  }
  
});