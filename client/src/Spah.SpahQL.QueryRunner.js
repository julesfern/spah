/**
 * class Spah.SpahQL.QueryRunner
 *
 * Class responsible for executing parsed <code>Spah.SpahQL.Query</code> queries and returning sets
 * of <code>Spah.SpahQL.QueryResult</code> instances.
 *
 * Unless you're spelunking or fixing bugs, the only methods you care about are _select_ and _assert_.
 **/
Spah.SpahQL.QueryRunner = function() {};
window["Spah"]["SpahQL"]["QueryRunner"] = Spah.SpahQL.QueryRunner;

// Singletons
jQuery.extend(Spah.SpahQL.QueryRunner, {
  
  /**
   * Spah.SpahQL.QueryRunner.select(query, data) -> Array of Spah.SpahQL.QueryResult instances
   * - query (Spah.SpahQL.Query): A parsed query instance
   * - data (Object): The data against which to run the query
   *
   * Executes a selection query against the given dataset. Returns an array of result instances.
   **/
  "select": function(query, data) {
    return this.evalQueryToken(query.primaryToken, data, data);
  },
  
  /**
   * Spah.SpahQL.QueryRunner.assert(query, data) -> Boolean result
   * - query (Spah.SpahQL.Query): A parsed query instance
   * - data (Object): The data against which to run the query
   *
   * Executes and ssserts the truthiness of a selection or assertion query against the given dataset. 
   * Returns a boolean indicating the overall result of the query - if the query is not an assertion
   * query, it will return true if the query returns one or more results.
   **/
  "assert": function(query, data) {
    
  },
  
  /**
   * Spah.SpahQL.QueryRunner.evalQueryToken(token, data) -> Array of Spah.SpahQL.QueryResult instances
   * - token (Object): One of the primary or secondary tokens from a Query instance. May be a selection query or a set literal.
   * - data (Object): The data scope against which any selection queries in the token top level will be run.
   *
   * Translates a selection query or set literal to a series of results
   **/
  evalQueryToken: function(queryToken, rootData, scopeData) {
    if(queryToken.type == Spah.SpahQL.QueryParser.TOKEN_SET_LITERAL) {
      return this.evalSetLiteralToken(queryToken, rootData, scopeData);
    }
    else if(queryToken.type == Spah.SpahQL.QueryParser.TOKEN_SELECTION_QUERY) {
      return this.evalSelectionQueryToken(queryToken, rootData, scopeData);
    }
    else {
      throw new Spah.SpahQL.Errors.SpahQLRunTimeError("Unsupported token in query: "+queryToken);
    }
  },
  
  /**
   * Spah.SpahQL.QueryRunner.evalSelectionQueryToken(query, rootData, scopeData, scopePath) -> Array of Spah.SpahQL.QueryResult instances
   * - query (Object): A selection query token taken from a Query instance.
   * - rootData (Object): The entire root-level data structure being queried
   * - scopeData (Object): The data for the scope at which this query is being executed.
   * - scopePath (String): The string path for the root of the scopeData argument.
   *
   * Evaluates all the path components in the given query in turn, creating an array of QueryResult instances.
   **/
  evalSelectionQueryToken: function(query, rootData, scopeData, scopePath) {
    // Start off with a simulated result using the data required by the query
    var results = [
      new Spah.SpahQL.QueryResult(
        ((query.useRoot)? null : scopePath) || "/", 
        ((query.useRoot)? rootData : scopeData)
      )
    ];
    
    // Loop path components and pass reduced data
    for(var i=0; i< query.pathComponents.length; i++) {
      var pcResults = []; // The results, flattened, for this path component   
         
      for(var j=0; j < results.length; j++) {
        // Run each result from the previous iteration through the path component evaluator.
        // Resultset for initial run is defined at top of this method.
        pcResults = pcResults.concat(
          this.evalSelectionQueryPathComponent(query.pathComponents[i], rootData, results[j].value, results[j].path)
        );
      }
      results = pcResults;
      // only continue if there are results to work with
      if(results.length == 0) break;
    }
    return results;
  },
  
  evalSelectionQueryPathComponent: function(pathComponent, rootData, scopeData, path) {
    var results;
    var scopePath = (!path || path == "/")? "" : path; // Root path is blanked for easy appending 
    
    if(pathComponent.key == null && pathComponent.property == null) {
      // Root query, 
      results = [new Spah.SpahQL.QueryResult(path, scopeData)]; // Uses original path arg
    }
    else if(pathComponent.key != null) {
      // Key query - key might be wildcard.
      results = this.fetchResultsFromObjectByKey(pathComponent.key, scopeData, scopePath, pathComponent.recursive);
    }
    else if(pathComponent.property != null) {
      // Property query
      results = this.fetchResultsFromObjectByProperty(pathComponent.property, scopeData, scopePath, pathComponent.recursive);
    }
    
    // Now filter results if there are filter queries
    
    // Return remainder
    return results;
  },
  
  fetchResultsFromObjectByKey: function(key, object, path, recursive) {
    var oType = Spah.State.DataHelper.objectType(object);
    var results = [];
    
    if(oType == "array" || oType == "object") {
      // Loop and append
      for(var oKey in object) {
        var oVal = object[oKey];
        var oValType = Spah.State.DataHelper.objectType(oVal);
        var oPath = path+"/"+oKey;
        // Match at this level
        if(key == Spah.SpahQL.QueryParser.ATOM_PATH_WILDCARD || key.toString() == oKey.toString()) {
          results.push(new Spah.SpahQL.QueryResult(oPath, oVal));
        }
        // Recurse! That is, if we should. Or not. It's cool.
        if(recursive && (oValType == "array" || oValType == "object")) {
          results = results.concat(this.fetchResultsFromObjectByKey(key, oVal, oPath, recursive));
        }
      }
    }
    
    return results;
  },
  
  fetchResultsFromObjectByProperty: function(property, object, path, recursive) {
    
  }
  
  
  
});