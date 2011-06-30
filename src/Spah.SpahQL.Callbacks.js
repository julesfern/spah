/**
 * class Spah.SpahQL.Callbacks
 *
 * Stores and manages the dispatch of modification callbacks on any data source that can be queried with SpahQL.
 **/
 
Spah.classCreate("Spah.SpahQL.Callbacks", {
  
  // Singleton
  // --------------------
  
  /**
   * Spah.SpahQL.Callbacks.callbacks -> Object
   *
   * A dictionary of all registered SpahQL callbacks, keyed by path. The value
   * is an array containing many arrays, each with a pointer to the object to which the callback refers, and the
   * callback function itself.
   **/
  "callbacks": {},
  
  "reset": function() {
    this.callbacks = {};
  },
  
  /**
   * Spah.SpahQL.Callbacks.callbacksForPathInObject(path, object) -> Array
   * - path (String): The path for which you are pulling all registered callbacks.
   * - object (Object): The object (which should have previously been queried with SpahQL) in which the path exists.
   * 
   **/
  "callbacksForPathInObject": function(path, object) {
    var pathCallbacks = this.callbacks[path];
    var matchingCallbacks = [];
    if(pathCallbacks) {
      for(var i in pathCallbacks) {
        if(pathCallbacks[0] == object) matchingCallbacks.push(path);
      }
    }
    return matchingCallbacks;
  },
  
  /**
   * Spah.SpahQL.Callbacks.pathModifiedOnObject(path, data, oldvalue, newvalue) -> void
   *
   * Receives a signal from any modified query result that the data at a specific path has been replaced,
   * and triggers event dispatchers registered against the same path on the same data construct (using pointer
   * equality.)
   **/
  "pathModifiedOnObject": function(path, data, oldvalue, newvalue) {
    
  },
  
  "addCallbackForPathModifiedOnObject": function(path, object, callback) {
    this.callbacks[path] = this.callbacks[path] || [];
    this.callbacks[path].push([object, callback]);
  },
  
  "removeCallbackForPathModifiedOnObject": function(path, object, callback) {
    var pathCallbacks = this.callbacks[path];
    if(pathCallbacks) {
      for(var i=pathCallbacks.length-1; i>=0; i--) {
        if(pathCallbacks[i][0] == object && pathCallbacks[i][1] == callback) {
          this.callbacks[path] = pathCallbacks.splice(i,1);
        }
      }
    }
  }
  
});