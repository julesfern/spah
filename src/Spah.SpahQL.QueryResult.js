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
    this.sourceData = sourceData || value;
  },
  
  /**
   * Spah.SpahQL.QueryResult#type() -> String
   *
   * Runs this result's value through Spah.SpahQL.DataHelper#objectType and returns the
   * result.
   **/
  "type": function() {
    return Spah.SpahQL.DataHelper.objectType(this.value);
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
    var p = (!this.path || this.path == "/")? null : this.path.substring(0, this.path.lastIndexOf("/"));
    return (p=="")? "/" : p;
  },
  
  /**
   * Spah.SpahQL.QueryResult#keyName() -> String or null
   * 
   * Returns the name for this object, based on its path. If this result is the root
   * or if the result was not created from a path query then the method will return null.
   *
   *      select("/foo").first().keyName() //-> "foo"
   *      select("/foo/bar/.size").first().keyName() // -> ".size"
   **/
  "keyName": function() {
    return (!this.path || this.path == "/")? null : this.path.substring(this.path.lastIndexOf("/")+1);
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
   * Spah.SpahQL.QueryResult#detach() -> Spah.SpahQL.QueryResult
   *
   * Takes this query result and create new root-level QueryResult (with path "/").
   * The value of this QueryResult is deep-cloned and modifying the detached
   * result will not cause the original data to be modified, nor will it cause
   * modification events to be triggered on the original data.
   **/
  "detach": function() {
    var data = Spah.SpahQL.DataHelper.deepClone(this.value);
    return new Spah.SpahQL.QueryResult("/", data);
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
  },

  /**
   * Spah.SpahQL.QueryResult#contains(queryResult) -> Boolean
   * queryResult (Spah.SpahQL.QueryResult): A query result instance
   *
   * Determines if the given result is a child member of this result, by comparing the two paths.
   * Will never return true if the given query result has a different source data object to this
   * result, for example if one of the results is a clone created with #detach, #reduce, #expand
   * or a similar method.
   **/
  "contains": function(queryResult) {
    return  (this.sourceData == queryResult.sourceData) &&
            (
              (this.path == queryResult.path) ||
              (queryResult.path.indexOf(this.path+"/") == 0)
            );
  },
  
  /**
   * Spah.SpahQL.QueryResult#set(keyOrDict, value) -> Boolean
   * - keyOrDict (Integer, String, Object): The key to set on this object, or a hash of keys and values that you want to set.
   * - value (Object): The value to attribute to the given key. Ignored if keyOrDict is a hash.
   *
   * If this result has an array or object value, modified this result
   * by setting the given key to the given value. Returns true if the 
   * key is set successfully and false if the new value is rejected
   * because this result isn't enumerable.
   **/
  "set": function(keyOrDict, value) {
    var values;
    if(Spah.SpahQL.DataHelper.objectType(keyOrDict) == "object") {
      values = keyOrDict;
    }
    else {
      values = {};
      values[keyOrDict] = value;
    }

    for(var hKey in values) {
      var v = values[hKey];
      var k = Spah.SpahQL.DataHelper.coerceKeyForObject(hKey, this.value);

      if(k != null) {
        if(!Spah.SpahQL.DataHelper.eq(v, this.value[k])) {
          var prev = this.value[k];
          this.value[k] = v;
          this.triggerModificationCallbacks(prev, v, "/"+k);
        }
      }
      else {
        return false;
      }
    }
    return true;
  },
  
  /**
   * Spah.SpahQL.QueryResult#replace(value) -> Boolean
   * - value (Object): The value to replace this query result's value.
   *
   * Replaces the data on this query result, modifying the queried data
   * in the process. If this result is the root object, the replace will
   * not be performed and will return false. If this result was not created
   * from a path query then the replace method will simply set the value
   * on this result instance and return true. Otherwise, the result of
   * setting this result's key on the parent object will be returned.
   *
   *      // Equivalent to
   *      myResult.parent().set(myResult.keyName(), value);
   **/
  "replace": function(value) {
    var k = this.keyName();
    if(this.path != "/" && !Spah.SpahQL.DataHelper.eq(this.value, value)) {
        var prev = this.value;
        this.value = value;
        var p = this.parent();
        if(p) {
          return (p&&k)? p.set(k, value) : false; 
        }
        else {
          this.triggerModificationCallbacks(prev, value);
          return true;
        }
    }
    return false;
  },

  /**
   * Spah.SpahQL.QueryResult#append(value) -> Spah.SpahQL.QueryResult
   * - value (*): A value to be appended to this result
   *
   * Appends a value to the data for this QueryResult, if this QueryResult is of a type amenable to appending (arrays, strings)
   * If this instance has an array value, the given value will be appended to the array (not concatenated). If this instance
   * has a string value, the given value will be appended to the end of the string.
   *
   * Returns self.
   **/
  "append": function(value) {
    if(this.type() == "array") {
      this.set(this.value.length, value);
    }
    else if(this.type() == "string") {
      this.replace(this.value+value);
    }
    return this;
  },

  /**
   * Spah.SpahQL.QueryResult#prepend(value) -> Spah.SpahQL.QueryResult
   * - value (*): A value to be prepended to this result
   *
   * Adds a value to the beginning of the data for this QueryResult, if this QueryResult is of a type amenable to appending (arrays, strings)
   * If this instance has an array value, the given value will be appended to the front of the array (not concatenated). If this instance
   * has a string value, the given value will be appended to the start of the string.
   *
   * Returns self.
   **/
  "prepend": function(value) {
    if(this.type() == "array") {
      this.replace(([value]).concat(this.value));
    }
    else if(this.type() == "string") {
      this.replace(value+this.value);
    }
    return this;
  },

  "insert": function(valueOrArrayOfValues) {

  },
  
  /**
   * Spah.SpahQL.QueryResult#delete(key1, key2, keyN) -> QueryResult
   *
   * Deletes data from this result. If one or more keys is given as an argument, 
   * those keys will be deleted from this value in reverse alphanumeric order. If no arguments are
   * given, the entire result will be deleted from its parent.
   *
   * Deletion takes different effects depending on the data type of this query result.
   * Arrays are spliced, removing the specified index from the array without leaving an empty space
   * (hence the reverse ordering, to avoid array corruption). Objects/Hashes will have the specified
   * keys removed, if those keys exist.
   *
   * The root data construct may not be deleted. This method always returns <code>this</code>.
   **/
  "delete": function() {
    if(arguments.length > 0) {
      // Key deletion
      var keys = []; for(var i=0; i<arguments.length; i++) { keys.push(arguments[i]); };
          keys.sort(function(a, b) { return (a.toString()>b.toString())? -1 : 1; });
      var modified = false;
      var oldVal, newVal;
      var type = this.type();
      
      // Shallow-clone original value...
      // Original value is cloned so that new value can remain pointed to source data.
      if(type == "array") {
        // Doing array splice
        oldVal = this.value.slice(0); // shallow array clone
      }
      else if(type == "object") {
        // Doing hash delete
        oldVal = {};
        for(var v in this.value) { 
          // Shallow hash clone
          oldVal[v] = this.value[v]; 
        }
      }
       
      // Loop keys and remove
      for(var k=0; k<keys.length; k++) {
        var cKey = Spah.SpahQL.DataHelper.coerceKeyForObject(keys[k], this.value);
        if(cKey) {
          if(type == "array") {
            // Doing array splice
            this.value.splice(cKey, 1);
          }
          else if(type == "object") {
            // Doing hash delete
            delete this.value[cKey];
          }
          newVal = this.value;
        }
      }
      
      if(newVal) {
        this.triggerModificationCallbacks(oldVal, newVal);
      }
    }
    else {
      // Self-deletion
      var k = this.keyName();
      var p = this.parent();
      if(p && k) {
        p.delete(k);
      }
    }
    
    
    return this;
  },
  
  
  /**
   * Spah.SpahQL.QueryResult#triggerModificationCallbacks(oldValue, newValue, relativePath) -> void
   *
   * Used to trigger callbacks following a modification on this result or on a subkey of this object.
   * You probably don't want to use this in your app code.
   **/
  "triggerModificationCallbacks": function(oldValue, newValue, relativePath) {
    var modifiedAbsolutePath;
    if(relativePath) {
      modifiedAbsolutePath = ((this.path=="/")? "" : this.path)+relativePath;
    }
    else {
      modifiedAbsolutePath = this.path;
    }
    Spah.SpahQL.Callbacks.pathModifiedOnObject(modifiedAbsolutePath, this.sourceData, oldValue, newValue)
  },
  
  /**
   * Spah.SpahQL.QueryResult#modified(pathOrCallback[, callback]) -> void
   * - pathOrCallback (Function, String): The path relative to this result to which you want to bind the listener.
   * - callback (Function): If pathOrCallback is given as a string, this second argument should be the callback function.
   *
   * Registers a callback to be triggered when data within this path (including descendants of this path)
   * is modified on the object from which this query result was generated. The callback is not bound to this
   * particular result instance, but instead registered on the Spah.SpahQL.Callbacks module.
   *
   * Upon modification, the callback will be triggered with arguments <code>path</code> (the path of the modified data),
   * and <code>result</code> (a QueryResult representing the newly-modified value). The <code>result</code> argument
   * may be <code>undefined</code> if the data at that path was removed during the modification.
   **/
  "modified": function(pathOrCallback, callback) {
    // Get callback func
    var cbFunc = (callback)? callback : pathOrCallback;
    // Get path for event
    var pathArg = (callback)? pathOrCallback : null;
    var path = (this.path=="/")? (pathArg||this.path) : this.path + (pathArg||"");
    
    Spah.SpahQL.Callbacks.addCallbackForPathModifiedOnObject(path, this.sourceData, cbFunc);
  },
  
  
  
});