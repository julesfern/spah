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
    return this.item("/", data, data);
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
   *
   * It's recommended that you leave this method to be used by Spah's internals, and instead use
   * SpahQL.db(data) to create new SpahQL resources.
   **/
  "init": function(results) {
    Object.defineProperty(this, "dh", {value: Spah.SpahQL.DataHelper, enumerable: false});
    if(!results) {
      return;
    }
    else {
      results = (arguments.length > 1)? Array.prototype.slice.call(arguments) : results;
      results = (results.value && typeof(results.value)!="function")? [results] : results;
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
  "keyName": function(p) {
    p = p || this.path();
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

  /**
   * Spah.SpahQL#type() -> String
   *
   * Returns the type of data for the first item in this set as a string, e.g. "array", "object", "number" etc.
   **/
  "type": function(value) {
    var v = value || this.value();
    return this.dh.objectType(v);
  },

  /**
   * Spah.SpahQL#types() -> Array
   *
   * Returns a map of data types for all items in this set, e.g. ["array", "object", "number"]
   **/
  "types": function() {
    var scope = this;
    return this.map(function() {
      return scope.type(this.value());
    });
  },

  /**
   * Spah.SpahQL#filter(query) -> Spah.SpahQL
   * - query (String): A SpahQL assertion query.
   *
   * Runs the given assertion against each item in this set and returns a new SpahQL set containing
   * only those items meeting the given assertion.
   **/
  "filter": function(query) {
    var matches = [];
    this.each(function() {
      if(this.assert(query)) matches.push(this[0]);
    });
    return new Spah.SpahQL(matches);
  },

  /**
   * Spah.SpahQL#concat(otherSpahQL) -> Spah.SpahQL
   * - otherSpahQL (Spah.SpahQL): Any other Spah.SpahQL instance.
   *
   * Creates and returns a new SpahQL set containing all results from this instance followed
   * by all results from the given instance.
   **/
  "concat": function(otherSpahQL) {
    var conc = [];
    for(var i=0; i<this.length; i++) conc.push(this[i]);
    for(var j=0; j<otherSpahQL.length; j++) conc.push(otherSpahQL[j]);
    return new Spah.SpahQL(conc);
  },
  

});


///**
// * class Spah.SpahQL.QueryResult
// *
// * A simple model wrapping an individual result returned from a SpahQL query.
// **/
// 
//
//Spah.classCreate("Spah.SpahQL.QueryResult", {
//  // Singletons
//  // --------------------
//},{
//  
//  // Instance
//  // -------------------
//  
//  /**
//   * Spah.SpahQL.QueryResult#path -> String path or null
//   * 
//   * The SpahQL object path from which this result was garnered, if it was gathered from an object path.
//   * Results garnered from literals will not have paths associated with them.
//   **/
//  "path": null,
//  
//  /**
//   * Spah.SpahQL.QueryResult#value -> Array, object, boolean, string or null
//   * 
//   * The raw value of this query result as represented in the queried object.
//   **/
//  "value": null,
//  
//  /**
//   * Spah.SpahQL.QueryResult#sourceData -> Object
//   *
//   * The data in which this query result was found.
//   **/
//  "sourceData": null,
//  
//  /**
//   * new Spah.SpahQL.QueryResult(path, value, sourceData)
//   *
//   * Creates a new instance with the specified path and value.
//   * The sourceData argument specifies the root data context in which this result was found.
//   **/
//  "init": function(path, value, sourceData) {
//    this.path = path; 
//    this.value = value; 
//    this.sourceData = sourceData || value;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#type() -> String
//   *
//   * Runs this result's value through Spah.SpahQL.DataHelper#objectType and returns the
//   * result.
//   **/
//  "type": function() {
//    return Spah.SpahQL.DataHelper.objectType(this.value);
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#parentPath() -> String or null
//   * 
//   * Returns the path for the object in the queried data which contains this result.
//   * If this result is the root, the method will return null. If this result was
//   * not produced by a path at all, but rather a set literal, range or other construct,
//   * it will return null.
//   **/
//  "parentPath": function() {
//    var p = (!this.path || this.path == "/")? null : this.path.substring(0, this.path.lastIndexOf("/"));
//    return (p=="")? "/" : p;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#keyName() -> String or null
//   * 
//   * Returns the name for this object, based on its path. If this result is the root
//   * or if the result was not created from a path query then the method will return null.
//   *
//   *      select("/foo").first().keyName() //-> "foo"
//   *      select("/foo/bar/.size").first().keyName() // -> ".size"
//   **/
//  "keyName": function() {
//    return (!this.path || this.path == "/")? null : this.path.substring(this.path.lastIndexOf("/")+1);
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#parent() -> null, Spah.SpahQL.QueryResult
//   *
//   * Retrieves the parent object from the data construct that originally generated this
//   * query result. Remember to always assume that the data may have been modified in the 
//   * meantime.
//   **/
//  "parent": function() {
//    var path = this.parentPath();
//    return (path)? Spah.SpahQL.select(path, this.sourceData).first() : null;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#detach() -> Spah.SpahQL.QueryResult
//   *
//   * Takes this query result and create new root-level QueryResult (with path "/").
//   * The value of this QueryResult is deep-cloned and modifying the detached
//   * result will not cause the original data to be modified, nor will it cause
//   * modification events to be triggered on the original data.
//   **/
//  "detach": function() {
//    var data = Spah.SpahQL.DataHelper.deepClone(this.value);
//    return new Spah.SpahQL.QueryResult("/", data);
//  },
//
//  /**
//   * Spah.SpahQL.QueryResult#select(query) -> Spah.SpahQL.QueryResultSet
//   *
//   * Runs a selection query scoped to this result's path and data, and returns the results.
//   * For instance:
//   *
//   *      select("/foo/foo").first().select("/foo") // Is exactly the same as just querying for /foo/foo/foo.
//   **/
//  "select": function(query) {
//    return Spah.SpahQL.select(query, this.sourceData, this.value, this.path);
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#assert(query) -> Spah.SpahQL.QueryResultSet
//   *
//   * Runs an assertion query scoped to this result's path and data, and returns the result. For instance:
//   *
//   *      select("/foo/foo").first().assert("/foo") // Is exactly the same as just asserting /foo/foo/foo.
//   **/
//  "assert": function(query) {
//    return Spah.SpahQL.assert(query, this.sourceData, this.value, this.path);
//  },
//
//  /**
//   * Spah.SpahQL.QueryResult#contains(queryResult) -> Boolean
//   * queryResult (Spah.SpahQL.QueryResult): A query result instance
//   *
//   * Determines if the given result is a child member of this result, by comparing the two paths.
//   * Will never return true if the given query result has a different source data object to this
//   * result, for example if one of the results is a clone created with #detach, #reduce, #expand
//   * or a similar method.
//   **/
//  "contains": function(queryResult) {
//    return  (this.sourceData == queryResult.sourceData) &&
//            (
//              (this.path == queryResult.path) ||
//              (queryResult.path.indexOf(this.path+"/") == 0)
//            );
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#set(keyOrDict, value) -> Boolean
//   * - keyOrDict (Integer, String, Object): The key to set on this object, or a hash of keys and values that you want to set.
//   * - value (Object): The value to attribute to the given key. Ignored if keyOrDict is a hash.
//   *
//   * If this result has an array or object value, modified this result
//   * by setting the given key to the given value. Returns true if the 
//   * key is set successfully and false if the new value is rejected
//   * because this result isn't enumerable.
//   **/
//  "set": function(keyOrDict, value) {
//    var values;
//    if(Spah.SpahQL.DataHelper.objectType(keyOrDict) == "object") {
//      values = keyOrDict;
//    }
//    else {
//      values = {};
//      values[keyOrDict] = value;
//    }
//
//    for(var hKey in values) {
//      var v = values[hKey];
//      var k = Spah.SpahQL.DataHelper.coerceKeyForObject(hKey, this.value);
//
//      if(k != null) {
//        if(!Spah.SpahQL.DataHelper.eq(v, this.value[k])) {
//          var prev = this.value[k];
//          this.value[k] = v;
//          this.triggerModificationCallbacks(prev, v, "/"+k);
//        }
//      }
//      else {
//        return false;
//      }
//    }
//    return true;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#replace(value) -> Boolean
//   * - value (Object): The value to replace this query result's value.
//   *
//   * Replaces the data on this query result, modifying the queried data
//   * in the process. If this result is the root object, the replace will
//   * not be performed and will return false. If this result was not created
//   * from a path query then the replace method will simply set the value
//   * on this result instance and return true. Otherwise, the result of
//   * setting this result's key on the parent object will be returned.
//   *
//   *      // Equivalent to
//   *      myResult.parent().set(myResult.keyName(), value);
//   **/
//  "replace": function(value) {
//    var k = this.keyName();
//    if(this.path != "/" && !Spah.SpahQL.DataHelper.eq(this.value, value)) {
//        var prev = this.value;
//        this.value = value;
//        var p = this.parent();
//        if(p) {
//          return (p&&k)? p.set(k, value) : false; 
//        }
//        else {
//          this.triggerModificationCallbacks(prev, value);
//          return true;
//        }
//    }
//    return false;
//  },
//
//  /**
//   * Spah.SpahQL.QueryResult#append(value) -> Spah.SpahQL.QueryResult
//   * - value (*): A value to be appended to this result
//   *
//   * Appends a value to the data for this QueryResult, if this QueryResult is of a type amenable to appending (arrays, strings)
//   * If this instance has an array value, the given value will be appended to the array (not concatenated). If this instance
//   * has a string value, the given value will be appended to the end of the string.
//   *
//   * Returns self.
//   **/
//  "append": function(value) {
//    if(this.type() == "array") {
//      this.set(this.value.length, value);
//    }
//    else if(this.type() == "string") {
//      this.replace(this.value+value);
//    }
//    return this;
//  },
//
//  /**
//   * Spah.SpahQL.QueryResult#concat(arr) -> Spah.SpahQL.QueryResult
//   * - arr (Array): An array of values to be concatenated to the end of this instance's value
//   *
//   * Concatenates an array to this instance's value, if this instance's value is an array.
//   * Returns self.
//   **/
//  "concat": function(values) {
//    values = (arguments.length > 1)? Array.prototype.slice.call(arguments) : values;
//
//    if(this.type() == "array") {
//      this.replace(this.value.concat(values));
//    }
//    return this;
//  },
//
//  /**
//   * Spah.SpahQL.QueryResult#unshift(arr) -> Spah.SpahQL.QueryResult
//   * - arr (Array): An array of values to be concatenated to the start of this instance's value
//   *
//   * Concatenates this instance's value to the given array, if this instance's value is an array.
//   * Returns self.
//   **/
//  "unshift": function(values) {
//    values = (arguments.length > 1)? Array.prototype.slice.call(arguments) : values;
//
//    if(this.type() == "array") {
//      this.replace(values.concat(this.value));
//    }
//    return this;
//  },
//
//  /**
//   * Spah.SpahQL.QueryResult#prepend(value) -> Spah.SpahQL.QueryResult
//   * - value (*): A value to be prepended to this result
//   *
//   * Adds a value to the beginning of the data for this QueryResult, if this QueryResult is of a type amenable to appending (arrays, strings)
//   * If this instance has an array value, the given value will be appended to the front of the array (not concatenated). If this instance
//   * has a string value, the given value will be appended to the start of the string.
//   *
//   * Returns self.
//   **/
//  "prepend": function(value) {
//    if(this.type() == "array") {
//      this.replace(([value]).concat(this.value));
//    }
//    else if(this.type() == "string") {
//      this.replace(value+this.value);
//    }
//    return this;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#delete(key1, key2, keyN) -> QueryResult
//   *
//   * Deletes data from this result. If one or more keys is given as an argument, 
//   * those keys will be deleted from this value in reverse alphanumeric order. If no arguments are
//   * given, the entire result will be deleted from its parent.
//   *
//   * Deletion takes different effects depending on the data type of this query result.
//   * Arrays are spliced, removing the specified index from the array without leaving an empty space
//   * (hence the reverse ordering, to avoid array corruption). Objects/Hashes will have the specified
//   * keys removed, if those keys exist.
//   *
//   * The root data construct may not be deleted. This method always returns <code>this</code>.
//   **/
//  "delete": function() {
//    if(arguments.length > 0) {
//      // Key deletion
//      var keys = []; for(var i=0; i<arguments.length; i++) { keys.push(arguments[i]); };
//          keys.sort(function(a, b) { return (a.toString()>b.toString())? -1 : 1; });
//      var modified = false;
//      var oldVal, newVal;
//      var type = this.type();
//      
//      // Shallow-clone original value...
//      // Original value is cloned so that new value can remain pointed to source data.
//      if(type == "array") {
//        // Doing array splice
//        oldVal = this.value.slice(0); // shallow array clone
//      }
//      else if(type == "object") {
//        // Doing hash delete
//        oldVal = {};
//        for(var v in this.value) { 
//          // Shallow hash clone
//          oldVal[v] = this.value[v]; 
//        }
//      }
//       
//      // Loop keys and remove
//      for(var k=0; k<keys.length; k++) {
//        var cKey = Spah.SpahQL.DataHelper.coerceKeyForObject(keys[k], this.value);
//        if(cKey) {
//          if(type == "array") {
//            // Doing array splice
//            this.value.splice(cKey, 1);
//          }
//          else if(type == "object") {
//            // Doing hash delete
//            delete this.value[cKey];
//          }
//          newVal = this.value;
//        }
//      }
//      
//      if(newVal) {
//        this.triggerModificationCallbacks(oldVal, newVal);
//      }
//    }
//    else {
//      // Self-deletion
//      var k = this.keyName();
//      var p = this.parent();
//      if(p && k) {
//        p.delete(k);
//      }
//    }
//    
//    
//    return this;
//  },
//  
//  
//  /**
//   * Spah.SpahQL.QueryResult#triggerModificationCallbacks(oldValue, newValue, relativePath) -> void
//   *
//   * Used to trigger callbacks following a modification on this result or on a subkey of this object.
//   * You probably don't want to use this in your app code.
//   **/
//  "triggerModificationCallbacks": function(oldValue, newValue, relativePath) {
//    var modifiedAbsolutePath;
//    if(relativePath) {
//      modifiedAbsolutePath = ((this.path=="/")? "" : this.path)+relativePath;
//    }
//    else {
//      modifiedAbsolutePath = this.path;
//    }
//    Spah.SpahQL.Callbacks.pathModifiedOnObject(modifiedAbsolutePath, this.sourceData, oldValue, newValue)
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResult#modified(pathOrCallback[, callback]) -> void
//   * - pathOrCallback (Function, String): The path relative to this result to which you want to bind the listener.
//   * - callback (Function): If pathOrCallback is given as a string, this second argument should be the callback function.
//   *
//   * Registers a callback to be triggered when data within this path (including descendants of this path)
//   * is modified on the object from which this query result was generated. The callback is not bound to this
//   * particular result instance, but instead registered on the Spah.SpahQL.Callbacks module.
//   *
//   * Upon modification, the callback will be triggered with arguments <code>path</code> (the path of the modified data),
//   * and <code>result</code> (a QueryResult representing the newly-modified value). The <code>result</code> argument
//   * may be <code>undefined</code> if the data at that path was removed during the modification.
//   **/
//  "modified": function(pathOrCallback, callback) {
//    // Get callback func
//    var cbFunc = (callback)? callback : pathOrCallback;
//    // Get path for event
//    var pathArg = (callback)? pathOrCallback : null;
//    var path = (this.path=="/")? (pathArg||this.path) : this.path + (pathArg||"");
//    
//    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject(path, this.sourceData, cbFunc);
//  },
//  
//  
//  
//});
//
//

///**
// * class Spah.SpahQL.QueryResultSet
// *
// * Wraps an array of QueryResult objects and provides manipulation and traversal methods upon the set.
// **/
//Spah.classCreate("Spah.SpahQL.QueryResultSet", {
//  
//  // Singleton
//  // ------------------------------
//  
//}, {
//  
//  // Instance
//  // ------------------------------
//  
//  
//  /**
//   * Spah.SpahQL.QueryResultSet#set(keyOrDict[, value]) -> Boolean
//   * - keyOrDict (Integer, String, Object): The key that you want to set, or a hash of keys and values to set.
//   * - value (String): The value to which you want that key set. Ignored if keyOrDict is a hash.
//   *
//   * Calls set(key, value) on the first result in this result set and returns
//   * the boolean response.
//   **/
//  "set": function(keyOrDict, value) {
//    var r = this.first();
//    return (r)? r.set(keyOrDict, value) : false;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResultSet#replace(value) -> Boolean
//   * - value (Object): The value to replace the first result in this set.
//   *
//   * Calls replace(value) on the first result in this result set and returns
//   * the boolean response.
//   **/
//  "replace": function(value) {
//    var r = this.first();
//    return (r)? r.replace(value) : false;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResultSet#replaceAll(value) -> QueryResultSet
//   * - value (Object): The value to replace all results in this set.
//   *
//   * Calls replace(value) on each result in this result set and returns
//   * the set with values altered where possible.
//   **/
//  "replaceAll": function(value) {
//    this.each(function() {
//      this.replace(value);
//    });
//    return this;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResultSet#replaceEach(value, testCallback) -> QueryResultSet
//   * - value (Object): The value to replace any results where the test function is passed.
//   * - testCallback (Function): A function used to test each result in the set. The function will have the same
//   *    scope and arguments as the callback used in #each.
//   *
//   * Calls a test function for each result in this set in turn, and calls replace(value) on those results for which
//   * the test function returns <code>true</code>. Returns this set with the values modified.
//   **/
//  "replaceEach": function(value, testCallback) {
//    this.each(function(index, total) {
//      if(testCallback.apply(this, [index, total]) == true) {
//        this.replace(value);
//      }
//    });
//    return this;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResultSet#delete(key0, key1, keyN) -> QueryResult
//   *
//   * Calls delete() on the first result in this set (passing the arguments given) and returns the result.
//   **/
//  "delete": function() {
//    var f = this.first();
//    return (f)? f.delete.apply(f, arguments) : f;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResultSet.deleteAll() -> QueryResultSet
//   *
//   * Calls delete() on every result in this set and returns the set,
//   * which should now have values orphaned from the original data store.
//   **/
//  "deleteAll": function() {
//    this.each(function() {
//      this.delete();
//    });
//    return this;
//  },
//  
//  /**
//   * Spah.SpahQL.QueryResultSet#modified(callback) -> void
//   *
//   * Calls modified(callback) on every result in this set, registering the same callback function
//   * for modifications to every path represented in this result set.
//   **/
//  "modified": function(callback) {
//    this.each(function() {
//      this.modified(callback);
//    });
//  },
//  
//});
