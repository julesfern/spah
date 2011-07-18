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
  
  /**
   * Spah.SpahQL.QueryResultSet#set(key, value) -> Boolean
   * - key (Integer, String): The that you want to set.
   * - value (String): The value to which you want that key set.
   *
   * Calls set(key, value) on the first result in this result set and returns
   * the boolean response.
   **/
  "set": function(key, value) {
    var r = this.first();
    return (r)? r.set(key, value) : false;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#replace(value) -> Boolean
   * - value (Object): The value to replace the first result in this set.
   *
   * Calls replace(value) on the first result in this result set and returns
   * the boolean response.
   **/
  "replace": function(value) {
    var r = this.first();
    return (r)? r.replace(value) : false;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#replaceAll(value) -> QueryResultSet
   * - value (Object): The value to replace all results in this set.
   *
   * Calls replace(value) on each result in this result set and returns
   * the set with values altered where possible.
   **/
  "replaceAll": function(value) {
    this.each(function() {
      this.replace(value);
    });
    return this;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#replaceEach(value, testCallback) -> QueryResultSet
   * - value (Object): The value to replace any results where the test function is passed.
   * - testCallback (Function): A function used to test each result in the set. The function will have the same
   *    scope and arguments as the callback used in #each.
   *
   * Calls a test function for each result in this set in turn, and calls replace(value) on those results for which
   * the test function returns <code>true</code>. Returns this set with the values modified.
   **/
  "replaceEach": function(value, testCallback) {
    this.each(function(index, total) {
      if(testCallback.apply(this, [index, total]) == true) {
        this.replace(value);
      }
    });
    return this;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#delete(key0, key1, keyN) -> QueryResult
   *
   * Calls delete() on the first result in this set (passing the arguments given) and returns the result.
   **/
  "delete": function() {
    var f = this.first();
    return (f)? f.delete.apply(f, arguments) : f;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet.deleteAll() -> QueryResultSet
   *
   * Calls delete() on every result in this set and returns the set,
   * which should now have values orphaned from the original data store.
   **/
  "deleteAll": function() {
    this.each(function() {
      this.delete();
    });
    return this;
  },
  
  /**
   * Spah.SpahQL.QueryResultSet#modified(callback) -> void
   *
   * Calls modified(callback) on every result in this set, registering the same callback function
   * for modifications to every path represented in this result set.
   **/
  "modified": function(callback) {
    this.each(function() {
      this.modified(callback);
    });
  },
  
});
 