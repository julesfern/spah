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
   * new Spah.SpahQL(results[, result1][, result2])
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
  "parent": function(result) {
    var target = result || this[0];
    var path = this.parentPath(target.path);
    return (path && target)? Spah.SpahQL.select(path, target.sourceData) : null;
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
      var p = scope.parent(this[0]);
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

  /**
   * Spah.SpahQL#detach() -> Spah.SpahQL
   *
   * Creates and returns the first item from this set as a new SpahQL database, using
   * a deep clone of the item's value.
   *
   * For instance:
   *
   *  var myDb = Spah.SpahQL.db({foo: {bar: "baz"}});
   *  var foo = myDb.select("/foo");
   *  foo.path() // -> "/foo"
   *  foo.value() //-> {bar: "baz"};
   *  var fooClone = foo.detach();
   *  fooClone.path() //-> "/"
   *  fooClone.value() //-> {bar: "baz"}
   *  fooClone.value() == foo.value() //-> false
   *  fooClone.set("bar", "baz-changed")
   *  fooClone.select("/bar").value() //-> "baz-changed"
   *  foo.select("/bar").value() //-> "baz"
   **/
  "detach": function() {
    var data = this.dh.deepClone((this[0])? this[0].value : null);
    return Spah.SpahQL.db(data);
  },

  /**
   * Spah.SpahQL#set(key, value) -> Spah.SpahQL
   * - key (String, Number): The key to set on this result
   * - value (*): The value to set for the given key
   * Spah.SpahQL#set(dictionary) -> Spah.SpahQL
   * - dictionary (Object): A key/value hash containing multiple keys to be set.
   *
   * Take the data for the first result item in this set, and set a key on it.
   * Has no effect if the data being modified is a basic type such as a string
   * or number.
   *
   *    var db = Spah.SpahQL.db({foo: {a: "b"}});
   *    var foo = db.select("/foo");
   *    foo.set("new-key", "moose"); //-> data is now {foo: {a: "b", "new-key": "moose"}}
   *
   * Returns self.
   **/
  "set": function(keyOrDict, value, result) {
    var values;
    var target = result || this[0];
    if(!target) return this;

    if(this.dh.objectType(keyOrDict) == "object") {
      values = keyOrDict;
    }
    else {
      values = {};
      values[keyOrDict] = value;
    }

    var dispatch = false;
    var originalValue = this.dh.deepClone(target.value);

    for(var hKey in values) {
      var v = values[hKey];
      var k = this.dh.coerceKeyForObject(hKey, target.value);

      if(k != null) {
        if(!this.dh.eq(v, target.value[k])) {
          target.value[k] = v;
          dispatch = true;
        }
      }
    }
    if(dispatch) this.resultModified(target, originalValue);
    return this;
  },

  /**
   * Spah.SpahQL#setAll(key, value) -> Spah.SpahQL
   * - key (String, Number): The key to set on this result
   * - value (*): The value to set for the given key
   * Spah.SpahQL#setAll(dictionary) -> Spah.SpahQL
   * - dictionary (Object): A key/value hash containing multiple keys to be set.
   *
   * Just like #set, only it attempts to set the given key(s) on all items in this set:
   *
   *    db.select("//foo").set("a", "a-value") // Attempt to set "a" on all "foo" objects
   *
   * Just like #set, returns self.
   **/
  "setAll": function(keyOrDict, value) {
    for(var i=0; i<this.length; i++) this.set(keyOrDict, value, this[i]);
    return this;
  },

  /**
   * Spah.SpahQL#replace(value) -> Spah.SpahQL
   * - value (Object): The value to replace this query result's value.
   *
   * Replaces the value of the first item in this set, modifying the queried data
   * in the process. If the first item in this set is the root, no action will be taken.
   *
   * Returns self.
   **/
  "replace": function(value, result) {
    var target = result || this[0];
    var k = this.keyName(target.path);

    if(k && target) {
        var prev = target.value;
        target.value = value;
        var p = this.parent(target);
        if(p) {
          p.set(k, value);
        }
        else {
          this.resultModified(target, prev);
        }
    }
    return this;
  },

  /**
   * Spah.SpahQL#replaceAll(value) -> Spah.SpahQL
   *
   * Works just like #replace, but takes action against every result in this set:
   *
   *    // Replace all hashes with a polite notice.
   *    db.select("//[/.type=='object']").replace("NO HASHES FOR YOU. ONE YEAR.")
   *
   **/
  "replaceAll": function(value) {
    for(var i=0; i<this.length; i++) this.replace(value, this[i]);
    return this;
  },

  /**
   * Spah.SpahQL#delete([key]) -> Spah.SpahQL
   *
   * Deletes data from the first result in this set. If a key is supplied, the key will be deleted from value.
   * If no arguments are given, the entire result will be deleted from its parent.
   *
   * Deletion takes different effects depending on the data type of this query result.
   * Arrays are spliced, removing the specified index from the array without leaving an empty space. 
   * Objects/Hashes will have the specified key removed, if the key exists.
   *
   * The root data construct may not be deleted. This method always returns self.
   **/
  "delete": function() {
    var target = (typeof(arguments[0])=="object")? arguments[0] : null;
    var ai = (target)? 1 : 0;
    target = target || this[0];

    if(!target) return this;

    if((ai > 0 && arguments.length > 1) || (ai==0 && arguments.length > 0)) {
      // Key deletion
      var key = arguments[ai];
      var modified = false;
      var oldVal, newVal;
      var type = this.type(target.value);
      
      // Shallow-clone original value...
      // Original value is cloned so that new value can remain pointed to source data.
      var cKey = Spah.SpahQL.DataHelper.coerceKeyForObject(key, target.value);
      if(type == "array") {
        // Doing array splice
        oldVal = target.value.slice(0); // shallow array clone
        target.value.splice(cKey, 1);
      }
      else if(type == "object") {
        // Doing hash delete
        oldVal = {};
        // Shallow hash clone
        for(var v in target.value) oldVal[v] = target.value[v];
        delete target.value[cKey];
      }
      this.resultModified(target, oldVal);
    }
    else {
      // Self-deletion
      var k = this.keyName(target.path);
      var p = this.parent(target);
      if(p && k) {
        p.delete(k);
      }
    }
    
    return this;
  },

  /**
   * Spah.SpahQL#deleteAll([key]) -> Spah.SpahQL
   *
   * Just like #delete, but called against every item in this set. Returns self.
   **/
  "deleteAll": function(key) {
    for(var i=0; i<this.length; i++) this.delete(this[i], key);
    return this;
  },

  /**
   * Spah.SpahQL#listen(path, callback) -> Spah.SpahQL
   * - path (String): A path relative to the items in this set, if you only want to listen for changes on a particular subkey.
   * - callback (Function): A function to be called when the data in this SpahQL set is modified.
   * Spah.SpahQL#listen(callback) -> Spah.SpahQL
   * - callback (Function): A function to be called when the data in this SpahQL set is modified.
   *
   * Registers a callback to be triggered when data within this set of results is modified.
   * Note that this method listens for changes on all items in this set:
   *
   *    var db = Spah.SpahQL.db(some_data);
   *    
   *    // Callback triggered whenever the first item in any array anywhere is modified
   *    db.select("//0").modified(function() {...}) 
   *    
   *    // Callback triggered only when a specific array is modified
   *    db.select("//0").item(0).modified(function() {....})
   *    
   *
   * Upon modification, the callback will be triggered with arguments:
   * - <code>result</code>: A SpahQL instance containing one result item, the item modified. This may be <code>undefined</code> if the data at that path was removed during the modification.
   * - <code>path</code>: The path being observed
   * - <code>subpaths</code>: An array of paths modified, relative to the path being observed. Empty if the observed path was itself replaced.
   *
   * Returns self.
   **/
  "listen": function(pathOrCallback, callback, remove) {
    // Get callback func
    var cbFunc = (callback)? callback : pathOrCallback;
    // Get path for event
    var pathArg = (callback)? pathOrCallback : null;

    for(var i=0; i<this.length; i++) {
      var res = this[i];
      var path = (res.path=="/")? (pathArg||res.path) : res.path + (pathArg||"");

      if(remove) Spah.SpahQL.Callbacks.removeCallbackForPathModifiedOnObject(path, res.sourceData, cbFunc);
      else Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject(path, res.sourceData, cbFunc);
    }
    
    return this;
  },

  /**
   * Spah.SpahQL#unlisten(path, callback) -> Spah.SpahQL
   * - path (String): The subpath previously subscribed using #listen
   * - callback (Function): The function registered as a callback using #listen
   * Spah.SpahQL#unlisten(callback) -> Spah.SpahQL
   * - callback (Function): The function registered as a callback using #listen
   *
   * Removes a listener previously created with #listen, accepting the same objects as arguments in order to identify the listener being destroyed.
   *
   * Returns self.
   */
  "unlisten": function(pathOrCallback, callback) {
    this.listen(pathOrCallback, callback, true);
  },

  /**
   * Spah.SpahQL#resultModified(result, oldValue) -> void
   * - result (Object): A primitive result object that was modified as a result of a modification made to this set
   * - oldValue (*): The prior value of the modified result
   *
   * Raises modification events for anything subscribing to changes to the modified path chain on the specified result object.
   **/
  "resultModified": function(result, oldValue) {
    Spah.SpahQL.Callbacks.pathModifiedOnObject(
      result.path, 
      result.sourceData, 
      oldValue, 
      result.value
    );
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
//  

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

//
