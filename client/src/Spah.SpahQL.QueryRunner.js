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
  
  // Constants for known symbols
  PROPERTY_TYPE: "type",
  PROPERTY_SIZE: "size",
  PROPERTY_EXPLODE: "explode",
  
  /**
   * Spah.SpahQL.QueryRunner.select(query, rootData[,scopeData]) -> Array of Spah.SpahQL.QueryResult instances
   * - query (Spah.SpahQL.Query): A parsed query instance
   * - rootData (Object): The root data context against which to run the query
   * - scopeData (Object): An optional additional data context which will be the local scope for this query. If not set, will be set internally to <code>rootData</code>.
   *
   * Executes a selection query against the given dataset. Returns an array of result instances.
   **/
  "select": function(query, rootData, scopeData) {
    if(query.assertion) throw new Spah.SpahQL.Errors.SpahQLRunTimeError("Attempted to select from an assertion query.");
    // Now move on
    scopeData = scopeData || rootData;
    return this.evalQueryToken(query.primaryToken, rootData, scopeData);
  },
  
  /**
   * Spah.SpahQL.QueryRunner.assert(query, rootData[, scopeData]) -> Boolean result
   * - query (Spah.SpahQL.Query): A parsed query instance
   * - rootData (Object): The root data context against which to run the query
   * - scopeData (Object): An optional additional data context which will be the local scope for this query. If not set, will be set internally to <code>rootData</code>.
   *
   * Executes and ssserts the truthiness of a selection or assertion query against the given dataset. 
   * Returns a boolean indicating the overall result of the query - if the query is not an assertion
   * query, it will return true if the query returns one or more results.
   **/
  "assert": function(query, rootData, scopeData) {
    scopeData = scopeData || rootData;
    if(query.assertion) {
      // Running assertion as assertion
      // TODO.
    }
    else {
      // Running selection as assertion
      return this.select(query, rootData, scopeData).length > 0;
    }
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
    if(results.length > 0 && pathComponent.filterQueries.length > 0) {
      var fI, rI;
      var filteredResults = [];
      for(fI=0; fI<pathComponent.filterQueries.length; fI++) {
        var q = pathComponent.filterQueries[fI];
        
        // Loop results and assert filters against the result's data
        for(rI = 0; rI < results.length; rI++) {
          var r = results[rI];
          if(filteredResults.indexOf(r) < 0 && this.assert(q, rootData, r.value)) {
            filteredResults.push(r);
          }
        }
        // Set results to those allowed by this filter query
        results = filteredResults;
      }
    }
    
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
    var oType = Spah.State.DataHelper.objectType(object);
    var pPath = path+"/."+property;
    var results = [];
    
    switch(property) {
      case this.PROPERTY_SIZE:
        switch(oType) {
          case "array": case "string":
            results.push(new Spah.SpahQL.QueryResult(pPath, object.length));
            break;
          case "object":
            results.push(new Spah.SpahQL.QueryResult(pPath, Spah.State.DataHelper.hashKeys(object).length));
            break;
        }
        break;
      case this.PROPERTY_TYPE:
        results.push(new Spah.SpahQL.QueryResult(pPath, oType));
        break;
      case this.PROPERTY_EXPLODE:
        if(oType =="string") {
          for(var c=0; c<object.length; c++) {
            results.push(new Spah.SpahQL.QueryResult(path+"/"+c, object.charAt(c)));
          }
        }
        break;
      default:
        throw new Spah.SpahQL.Errors.SpahQLRunTimeError("Unrecognised property token '"+property+"'.");
        break;
    }
    
    // recurse if needed
    if(recursive && (oType == "array" || oType == "object")) {
      for(var k in object) {
        var kPath = path+"/"+k;
        var kVal = object[k];
        results = results.concat(this.fetchResultsFromObjectByProperty(property, kVal, kPath, recursive));
      }
    }
    
    return results;
  },
  
  /**
   * Spah.SpahQL.QueryRunner.evalSetLiteralToken(queryToken, rootData[, scopeData]) -> Array of QueryResults
   * - queryToken (Object): The parsed query token, which must be a set literal
   * - rootData (Object): A root data context for any selection queries that appear in the literal
   * - scopeData (Object): A scoped data context for the scope at which selection queries in the set will be evaluated.
   *
   * Evaluates a set literal, for use when a set is used in a selection query and must be returned as a set of results.
   * If the set is a range, it will be flattened into a set of values.
   **/
  evalSetLiteralToken: function(queryToken, rootData, scopeData) {
    var results = [];
    if(queryToken.isRange) {
      var start = queryToken.values[0];
      var end = queryToken.values[1];
      var sType = Spah.State.DataHelper.objectType(start);
      var eType = Spah.State.DataHelper.objectType(end);
      if(sType == eType) {
        if(sType == "number") results = results.concat(this.evalNumericRange(start, end));
        else if(sType == "string") results = results.concat(this.evalStringRange(start, end));
        else new Spah.SpahQL.Errors.SpahQLRunTimeError("Unsupported type used in range. Ranges support only strings and numbers.");
      }
      else {
        throw new Spah.SpahQL.Errors.SpahQLRunTimeError("Illegal range with start type '"+sType+"' and end type '"+eType+"'. Ranges must use the same type at each end.");
      }
    }
    else {
      // Loop - evaluate queries
      for(var i in queryToken.values) {
        var val = queryToken.values[i];
        var oType = Spah.State.DataHelper.objectType(val);
        
        if(oType == "object") {
          results = results.concat(this.evalSelectionQueryToken(val, rootData, scopeData));
        }
        else {
          results.push(new Spah.SpahQL.QueryResult(null, val));
        }
        
      }
    }
    return results;
  },
  
  evalNumericRange: function(start, end) {
    
  },
  
  evalStringRange: function(start, end) {
    
  }
  
  
  
});