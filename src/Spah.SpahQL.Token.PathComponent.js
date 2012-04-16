/**
 * class Spah.SpahQL.Token.PathComponent < Spah.SpahQL.Token.Base
 *
 * A token describing any path component within a selection query, comprised of one or two path delimiters
 * followed by a key or property name and an optional set of filter query tokens.
 **/
 
Spah.classExtend("Spah.SpahQL.Token.PathComponent", Spah.SpahQL.Token.Base, {
  
    // Singleton
    // ---------------------------

    // Atom configuration: paths
    ATOM_PATH_DELIMITER: "/",
    ATOM_PROPERTY_IDENTIFIER: ".",
    ATOM_PATH_WILDCARD: "*",
    
    /**
     * Spah.SpahQL.Token.PathComponent.parseAt(index, queryString) -> Array result or null
     *
     * Reads the given queryString starting at the given index and attempts to identify and parse
     * a path component token. If found, the token will be returned in a tuple \[resumeIndex, foundToken\]. 
     * Returns null if nothing is found.
     **/
    "parseAt": function(i, query) {
      if(query.charAt(i) == this.ATOM_PATH_DELIMITER) {
        var j = i+1;
        var pc = new this();
        var usingProperty = false;

        // Grab second (recursive) slash
        if(query.charAt(j) == this.ATOM_PATH_DELIMITER) {
          pc.recursive = true;
          j++;
        }
        
        // Check for wildcard, which halts the key reader and moves on to filters
        if(query.charAt(j) == this.ATOM_PATH_WILDCARD) {
           // Expect filter or end
           pc.key = this.ATOM_PATH_WILDCARD;
           j++
        }
        else {
         // Get keyname / property name (until run out of alphanum/-/_)
         if(query.charAt(j) == this.ATOM_PROPERTY_IDENTIFIER) {
           usingProperty = true;
           j++
         }
         else if(query.charAt(j) == this.ATOM_PATH_DELIMITER) {
           this.throwParseErrorAt(j, query, "3 path delimiters found in a row. Maximum legal count is 2.");
         }

         // Read ahead for keyname, if not found then move on.
         var kReadResult = Spah.SpahQL.Token.KeyName.parseAt(j, query);
         if(!kReadResult && usingProperty) {
           this.throwParseError(j, query, "Found unexpected character '"+query.charAt(j)+"' when expecting TOKEN_PROPERTY")
         }
         else if(kReadResult) {
           if(usingProperty) pc.property = kReadResult[1];
           else pc.key = kReadResult[1];
           j = kReadResult[0];
         }
        }       
        // End keyname/propertyname segment
        // Start filters
        var fReadResult;
        while(fReadResult = Spah.SpahQL.Token.FilterQuery.parseAt(j, query)) {
          pc.filterQueries.push(fReadResult[1]);
          j = fReadResult[0];
        }

        // When out of filters, exit       
        return [j, pc]
      }

      return null;
    }
    
},{
  
    // Instance
    // ----------------------------------------
    
    // Constants for known symbols
    PROPERTY_TYPE: "type",
    PROPERTY_SIZE: "size",
    PROPERTY_EXPLODE: "explode",
    
    /**
     * Spah.SpahQL.Token.PathComponent#key -> String
     *
     * The key specified in this path component, if a keyname was used.
     **/
    "key": null,
    
    /**
     * Spah.SpahQL.Token.PathComponent#property -> String
     *
     * The property specified in this path component, if a property name was used.
     **/
    "property": null,
    
    /**
     * Spah.SpahQL.Token.PathComponent#recursive -> Boolean
     *
     * A flag indicating whether or not this path component should recurse through its
     * scope data during evaluation.
     **/
    "recursive": false,
    
    /**
     * Spah.SpahQL.Token.PathComponent#filterQueries -> Array Token.FilterQuery
     *
     * Lists all filter queries associated with this path component, in the order in which they were 
     * encountered during parsing.
     **/
    "filterQueries": [],
    
    /**
     * new Spah.SpahQL.Token.PathComponent(key, property, recursive, filterQueries)
     *
     * Instantiate a path component token with blank-slate values
     **/
    "init": function(key, property, recursive, filterQueries) {
      this.key = key || null;
      this.property = property || null;
      this.recursive = recursive || false;      
      this.filterQueries = filterQueries || [];
    },
    
    /**
     * Spah.SpahQL.Token.PathComponent#evaluate(rootData, scopeData, path) -> Array
     * - pathComponent (Object): A path component object as generated by the query parser
     * - rootData (Object): The entire root-level data structure being queried
     * - scopeData (Object): The data for the scope at which this query is being executed.
     * - path (String): The string path for the root of the scopeData argument.
     *
     * Evaluates this path pomponent and returns a set of query results.
     * Used primarily in Token.SelectionQuery#evaluate to map each path component to a set of results, allowing the query process to be 
     * effectively forked or halted.
     **/
    "evaluate": function(rootData, scopeData, path) {
      var results;
      var scopePath = (!path || path == "/")? "" : path; // Root path is blanked for easy appending 

      if(this.key == null && this.property == null) {
        // Root query, 
        results = [Spah.SpahQL.result(path, scopeData, rootData)]; // Uses original path arg
      }
      else if(this.key != null) {
        // Key query - key might be wildcard.
        var keyName = this.key.value; // pull from token
        results = this.fetchResultsFromObjectByKey(keyName, rootData, scopeData, scopePath, this.recursive);
      }
      else if(this.property != null) {
        // Property query
        var propertyName = this.property.value;
        results = this.fetchResultsFromObjectByProperty(propertyName, rootData, scopeData, scopePath, this.recursive);
      }

      // Now filter results if there are filter queries
      if(results.length > 0 && this.filterQueries.length > 0) {
        var fI, rI;

        // Loop filter queries
        for(fI=0; fI<this.filterQueries.length; fI++) {
          var filterQueryToken = this.filterQueries[fI];
          var filteredResults = [];

          // Loop results and assert filters against the result's data
          for(rI = 0; rI < results.length; rI++) {
            var r = results[rI];
            var filterResult = filterQueryToken.evaluate(rootData, r.value);

            if(filterResult && filteredResults.indexOf(r) < 0) {
              filteredResults.push(r);
            }
          } // result loop
          // Set results to those allowed by this filter query
          results = filteredResults;
        } // filter query loop
      } // condition

      // Return remainder
      return results;
    },
    
    /**
     * Spah.SpahQL.Token.PathComponent#fetchResultsFromObjectByKey(key, object, path, recursive) -> Array
     * - key (String): The key to be retrieved from the object. Numeric keys in string formare acceptable when accessing arrays.]
     * - rootData (Object): The root data structure being queried.
     * - scopeData (Object): The data structure from which the key's associated value will be retrieved
     * - path (String): The path at which the item used as the 'object' argument is located
     * - recursive (Boolean): A flag indicating whether the key should also be pulled from any child objects of the given object. I N C E P T I O N.
     *
     * Retrieves the value(s) associated with a given key from the given object, if such a key exists.
     **/
    fetchResultsFromObjectByKey: function(key, rootData, scopeData, path, recursive) {
      var oType = Spah.SpahQL.DataHelper.objectType(scopeData);
      var results = [];

      if(oType == "array" || oType == "object") {
        // Loop and append
        for(var oKey in scopeData) {
          var oVal = scopeData[oKey];
          var oValType = Spah.SpahQL.DataHelper.objectType(oVal);
          var oPath = path+"/"+oKey;
          // Match at this level
          if(key == Spah.SpahQL.QueryParser.ATOM_PATH_WILDCARD || key.toString() == oKey.toString()) {
            results.push(Spah.SpahQL.result(oPath, oVal, rootData));
          }
          // Recurse! That is, if we should. Or not. It's cool.
          if(recursive && (oValType == "array" || oValType == "object")) {
            results = results.concat(this.fetchResultsFromObjectByKey(key, rootData, oVal, oPath, recursive));
          }
        }
      }

      return results;
    },

    /**
     * Spah.SpahQL.Token.PathComponent#fetchResultsFromObjectByProperty(key, object, path, recursive) -> Array
     * - key (String): The key to be retrieved from the object. Numeric keys in string formare acceptable when accessing arrays.
     * - rootData (Object): The root data structure being queried.
     * - scopeData (Object): The data structure from which the key's associated value will be retrieved
     * - path (String): The path at which the item used as the 'object' argument is located
     * - recursive (Boolean): A flag indicating whether the key should also be pulled from any child objects of the given object. I N C E P T I O N.
     *
     * Retrieves the specified Spah object property from the given object, if the object supports the specified property.
     **/
    fetchResultsFromObjectByProperty: function(property, rootData, scopeData, path, recursive) {
      var oType = Spah.SpahQL.DataHelper.objectType(scopeData);
      var pPath = path+"/."+property;
      var results = [];

      switch(property) {
        case this.PROPERTY_SIZE:
          switch(oType) {
            case "array": case "string":
              results.push(Spah.SpahQL.result(pPath, scopeData.length, rootData));
              break;
            case "object":
              results.push(Spah.SpahQL.result(pPath, Spah.SpahQL.DataHelper.hashKeys(scopeData).length, rootData));
              break;
          }
          break;
        case this.PROPERTY_TYPE:
          results.push(Spah.SpahQL.result(pPath, oType, rootData));
          break;
        case this.PROPERTY_EXPLODE:
          if(oType =="string") {
            for(var c=0; c<scopeData.length; c++) {
              results.push(Spah.SpahQL.result(path+"/"+c, scopeData.charAt(c), rootData));
            }
          }
          break;
        default:
          throw new Spah.SpahQL.Errors.SpahQLRunTimeError("Unrecognised property token '"+property+"'.");
          break;
      }

      // recurse if needed
      if(recursive && (oType == "array" || oType == "object")) {
        for(var k in scopeData) {
          var kPath = path+"/"+k;
          var kVal = scopeData[k];
          results = results.concat(this.fetchResultsFromObjectByProperty(property, rootData, kVal, kPath, recursive));
        }
      }

      return results;
    }
    
});