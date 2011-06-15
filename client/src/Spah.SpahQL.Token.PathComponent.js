/**
 * class Spah.SpahQL.Token.PathComponent < Spah.SpahQL.Token.Base
 *
 * A token describing any path component within a selection query, comprised of one or two path delimiters
 * followed by a key or property name and an optional set of filter query tokens.
 **/
 
  // Define and export
  Spah.SpahQL.Token.PathComponent = function(key, property, recursive, filterQueries) { this.init(key, property, recursive, filterQueries); };
  window["Spah"]["SpahQL"]["Token"]["PathComponent"] = Spah.SpahQL.Token.PathComponent;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.PathComponent, Spah.SpahQL.Token.Base, {

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
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.PathComponent.prototype, Spah.SpahQL.Token.Base.prototype, {
    
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
    }
    
  });