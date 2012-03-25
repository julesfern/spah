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
   * Spah.SpahQL.QueryResultSet#set(keyOrDict[, value]) -> Boolean
   * - keyOrDict (Integer, String, Object): The key that you want to set, or a hash of keys and values to set.
   * - value (String): The value to which you want that key set. Ignored if keyOrDict is a hash.
   *
   * Calls set(key, value) on the first result in this result set and returns
   * the boolean response.
   **/
  "set": function(keyOrDict, value) {
    var r = this.first();
    return (r)? r.set(keyOrDict, value) : false;
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
 