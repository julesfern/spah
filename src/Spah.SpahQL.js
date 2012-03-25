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

Spah.SpahQL = Spah.classExtend("Spah.SpahQL", Array, {
  
  /**
   * Spah.SpahQL.db(data) -> Spah.SpahQL
   *
   * Create a new root-level SpahQL database with the given data.
   **/
  "db": function(data) {
    return new this(
      {path: "/", value: data, sourceData: data}
    );
  },

  /**
   * Spah.SpahQL.result(path, value, sourceData) -> Object
   * - path (String, null): The path for this result primitive
   * - value (*): The value at the given path
   * - sourceData (*): The source database on which events are dispatched
   *
   * Create and return a new result primitive to be wrapped in a Spah.SpahQL instance.
   **/
   "result": function(path, value, sourceData) {
      var r = {
        "path": path,
        "value": value,
        "sourceData": ((path)? sourceData : (sourceData || value))
      }
      return r;
   },

   "item": function(path, value, sourceData) {
      return new this(this.result(path, value, sourceData));
   },

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
    return new this(this.QueryRunner.select(pQuery, rootData, scopeData, scopePath));
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
  
}, {

  // INSTANCE
  // ------------------------------------------------------------------------

  /**
   * new Spah.SpahQL(results[, result1, result2])
   * 
   * Instantiate a new SpahQL monad with the given set of results. Each result is an object with keys
   * "path" (indicating the absolute path of the item), "value" (indicating the value at this path) and 
   * "sourceData" (indicating the original data structure from which this data was culled).
   **/
  "init": function(results) {
    Object.defineProperty(this, "dh", {value: Spah.SpahQL.DataHelper, enumerable: false});
    if(!results) {
      return;
    }
    else {
      results = (arguments.length > 1)? Array.prototype.slice.call(arguments) : results;
      results = (results.value)? [results] : results;
      for(var i in results) this.push(results[i]);
    }
  },

  /**
   * Spah.SpahQL#item(index) -> Spah.SpahQL
   * - index (Number): The index of the item you're after
   *
   * Retrieves a particular item from this set of results and returns a new SpahQL instance containing that item.
   **/
  "item": function(index) {
    return new Spah.SpahQL(this[index]);
  },

  /**
   * Spah.SpahQL#first() -> Spah.SpahQL
   *
   * Retrieves the first item from this set as a new SpahQL instance - which will be empty if this set is also empty. 
   **/
  "first": function() {
    return this.item(0);
  },

  /**
   * Spah.SpahQL#last() -> Spah.SpahQL
   *
   * Retrieves the last item from this set as a new SpahQL instance - which will be empty if this set is also empty. 
   **/
  "last": function() {
    return this.item(this.length-1);
  },

  /**
   * Spah.SpahQL#path() -> String, null
   *
   * Returns the absolute path for the first item in this set.
   **/
  "path": function() {
    return (this[0])? this[0].path : null;
  },

  /**
   * Spah.SpahQL#paths() -> Array
   *
   * Returns an array containing the absolute path for every item in this set.
   **/
  "paths": function() {
    return this.map(function() { return this.path() });
  },

  /**
   * Spah.SpahQL#value() -> String, null
   *
   * Returns the data value for the first item in this set.
   **/
  "value": function() {
    return (this[0])? this[0].value : null;
  },

  /**
   * Spah.SpahQL#values() -> Array
   *
   * Returns an array containing the data values for every item in this set.
   **/
  "values": function() {
    return this.map(function() { return this.value() });
  },

  /**
   * Spah.SpahQL#sourceData() -> Object
   *
   * The original, root-level object from which this SpahQL instance draws data.
   **/
  "sourceData": function() {
    return (this[0])? this[0].sourceData : null;
  },


  /**
   * Spah.SpahQL#each(callback) -> Spah.SpahQL
   * - callback (Function): A callback to execute against each result in the set. The callback will receive the arguments (index, total).
   *    within the function, the <code>this</code> keyword will refer to the QueryResult for this iteration.
   *
   * Executes the callback function with each item in this resultset. The 
   * loop is halted if the callback at any time returns false. This method will
   * return true if the loop completes, and false if it is halted midway. If the callback
   * function does not return anything, the loop will continue to completion.
   **/
  "each": function(callback) {
    for(var i=0; i<this.length; i++) {
      if(callback.apply(this.item(i), [i, this.length]) == false) break;
    }
    return this;
  },  

  /**
   * Spah.SpahQL#map(callback) -> Array
   * - callback (Function): A callback to execute against each result in the set. The callback is exactly as used with #each, but should return a value.
   *
   * Executes the callback function with each item in this set. The return value from
   * each iteration of the callback is appended to an array, which is returned at the end of the loop.
   **/
  "map": function(callback) {
    var a = [];
    for(var i=0; i<this.length; i++) {
      a.push(callback.apply(this.item(i), [i, this.length]));
    }
    return a;
  },

  /**
   * Spah.SpahQL#select(query) -> Spah.SpahQL
   *
   * Runs a selection query relative to all items in this set, and returns the results.
   * For instance:
   *
   *      select("/foo/foo").select("/foo") // identical to select("/foo/foo/foo")
   **/
  "select": function(query) {
    var results = [];
    this.each(function() {
      Spah.SpahQL.select(query, this.sourceData(), this.value(), this.path()).each(function() {
        results.push(this[0]);
      });
    });
    return new Spah.SpahQL(results);
  },

  /**
   * Spah.SpahQL#assert(query) -> Boolean
   *
   * Runs an assertion query against every item in this set. Returns <code>false</code> if any one item fails to meet the assertion.
   *
   *      select("/foo/foo").first().assert("/foo") // Is exactly the same as just asserting /foo/foo/foo.
   **/
  "assert": function(query) {
    var result = true; 
    this.each(function() {
      if(!Spah.SpahQL.assert(query, this.sourceData(), this.value(), this.path())) {
        result = false;
        return false;
      }
    });
    return result;
  },

  /**
   * Spah.SpahQL#parentPath() -> String or null
   * 
   * Returns the parent path for the first item in this set, or null if this item is the root.
   * For instance, a result with path "/foo/bar/baz" has parent path "/foo/bar"
   **/
  "parentPath": function(path) {
    var p = path || this.path(); 
    var pp = (!p || p == "/")? null : p.substring(0, p.lastIndexOf("/"));
    return (pp=="")? "/" : pp;
  },

  /**
   * Spah.SpahQL#parentPaths() -> Array
   *
   * Returns an array of containing the parent path of each item in this set.
   **/
  "parentPaths": function() {
    var scope = this;
    return this.map(function() {
      return scope.parentPath(this.path());
    })
  },

  /**
   * Spah.SpahQL#parent() -> null, Spah.SpahQL
   *
   * Retrieves the parent object from the data construct that originally generated this
   * query result. Remember to always assume that the data may have been modified in the 
   * meantime.
   **/
  "parent": function(item) {
    var target = (item || this).first();
    var path = target.parentPath();
    return (path && target.length > 0)? Spah.SpahQL.select(path, target.sourceData()).first() : null;
  },

  /**
   * Spah.SpahQL#parents() -> Spah.SpahQL
   *
   * Retrieves the parent object for the first item in this resultset.
   **/
  "parents": function() {
    var collection = [];
    var scope = this;
    this.each(function() {
      var p = scope.parent(this);
      if(p && p[0]) collection.push(p[0]);
    });
    return new Spah.SpahQL(collection);
  },

  /**
   * Spah.SpahQL#keyName() -> String or null
   * 
   * Returns the name for the first item in this set, based on its path. If the item is the root
   * or if the result was not created from a path query then the method will return null.
   *
   *      select("/foo").keyName() //-> "foo"
   *      select("/foo/bar/.size").keyName() // -> ".size"
   **/
  "keyName": function(path) {
    var p = path || this.path();
    return (!p || p == "/")? null : p.substring(p.lastIndexOf("/")+1);
  },

  /** 
   * Spah.SpahQL#keyNames() -> Array
   *
   * Returns an array of key names for all items in this set, based on the path of each item in the set.
   * Items which are not the result of path queries, such as set literals, will appear as null entries in the array.
   **/ 
  "keyNames": function() {
    var scope = this;
    return this.map(function() {
      return scope.keyName(this.path());
    })
  },

  "type": function(value) {
    var v = value || this.value();
    return this.dh.objectType(v);
  },

  "types": function() {
    var scope = this;
    return this.map(function() {
      return scope.type(this.value());
    });
  }

  // detach()
  // clone() 
  // set(keyOrDict)
  // setAll(keyOrDict)
  // replace()
  // replaceAll()
  // replaceEach()
  // delete()
  // deleteAll()
  // deleteEach()
  // append()
  // concat()
  // unshift()
  // prepend()
  // triggerModificationCallbacks
  // modified()

});