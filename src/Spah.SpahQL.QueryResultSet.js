/**
 * class Spah.SpahQL.QueryResultSet
 *
 * Wraps an array of QueryResult objects and provides manipulation and traversal methods upon the set.
 **/
Spah.classCreate("Spah.SpahQL.QueryResultSet", {
  
  // Singleton
  // ------------------------------
  
}, {
  
  // Instance
  // ------------------------------
  
  /**
   * new Spah.SpahQL.QueryResultSet(results)
   * - results (Array): An array of query result objects.
   *
   * Creates a new resultset from an array of QueryResult objects
   **/
  "init": function(results) {
    this.results = results || [];
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#all() -> Array of Spah.SpahQL.QueryResult objects
   *
   * Returns all items in the result set.
   **/
  "all": function() {
    return this.results;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#all() -> null, Spah.SpahQL.QueryResult
   *
   * Returns the first item in the result set.
   **/
  "first": function() {
    return this.item(0);
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#item(index) -> null, Spah.SpahQL.QueryResult
   *
   * Returns the item in the result set at the given index, or null.
   **/
  "item": function(index) {
    return this.results[index] || null;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#length() -> Integer
   *
   * Returns the number of results in this resultset.
   **/
  "length": function() {
    return this.results.length;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#each(callback) -> Boolean
   * - callback (Function): A callback to execute against each result in the set. The callback will receive the arguments (index, total).
   *    within the function, the <code>this</code> keyword will refer to the QueryResult for this iteration.
   *
   * Executes the callback function with each item in this resultset. The 
   * loop is halted if the callback at any time returns false. This method will
   * return true if the loop completes, and false if it is halted midway. If the callback
   * function does not return anything, the loop will continue to completion.
   **/
  "each": function(callback) {
    for(var i=0; i<this.length(); i++) {
      console.log("calling", this.item(i), [i, this.length()]);
      if(callback.apply(this.item(i), [i, this.length()]) == false) return false;
    }
    return true;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#map(callback) -> Array
   * - callback (Function): A callback to execute against each result in the set. The callback will receive the arguments (result, index, total),
   *    within the function, the <code>this</code> keyword will refer to the QueryResult for this iteration.
   *
   * Executes the callback function with each item in this resultset. The return value from
   * each iteration of the callback is appended to an array, which is returned at the end of the loop.
   **/
  "map": function(callback) {
    var a = [];
    for(var i=0; i<this.length(); i++) {
      a.push(callback.apply(this.item(i), [i, this.length()]));
    }
    return a;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#parentPath() -> null or String
   *
   * Retrieves the parent path for the first item in this resultset.
   **/
  "parentPath": function() {
    var item = this.item(0);
    return (item)? item.parentPath() : null;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#parent() -> null or QueryResult
   *
   * Retrieves the parent object for the first item in this resultset.
   **/
  "parent": function() {
    var item = this.item(0);
    return (item)? item.parent() : null;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#select(query) -> QueryResultSet
   * - query (String): The query to be executed.
   *
   * Executes a scoped selection query for each result in the set,
   * and compresses the results into a single resultset made unique by result path.
   **/
  "select": function(query) {
    var foundPaths = [];
    var results = [];
    
    this.each(function() {
      var thisResults = this.select(query);
      
      thisResults.each(function() {
        if(foundPaths.indexOf(this.path) < 0) {
          foundPaths.push(this.path);
          results.push(this);
        }
      });
    });
    
    return new Spah.SpahQL.QueryResultSet(results);
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#assert(query) -> Boolean
   * - query (String): The assertion query to be executed.
   *
   * Executes a scoped assertion query for each result in the set,
   * returning true if all results are successfully asserted and false
   * if any result fails to be asserted.
   **/
  "assert": function(query) {
    return this.each(function(i, total) {
      return this.assert(query);
    });
  },
  
});
 