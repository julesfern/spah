/**
 * class Spah.SpahQL.Token.SelectionQuery < Spah.SpahQL.Token.Base
 *
 * A token describing any selection query, comprised of an optional root flag followed by one or more
 * path components.
 **/
 
  // Define and export
  Spah.SpahQL.Token.SelectionQuery = function(pathComponents, useRoot) { this.init(pathComponents, useRoot) };
  window["Spah"]["SpahQL"]["Token"]["SelectionQuery"] = Spah.SpahQL.Token.SelectionQuery;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.SelectionQuery, Spah.SpahQL.Token.Base, {

    // Atom configuration: paths
    ATOM_PATH_ROOT: "$",
    
    /**
     * Spah.SpahQL.Token.SelectionQuery.parseAt(index, queryString) -> Array result or null
     *
     * Reads the given queryString starting at the given index and attempts to identify and parse
     * a selection query token. If found, the token will be returned in a tuple \[resumeIndex, foundToken\]. 
     * Returns null if nothing is found.
     **/
    "parseAt": function(i, query) {
      var ch = query.charAt(i);
      var firstComponent = Spah.SpahQL.Token.PathComponent.parseAt(i, query);
      if(ch == this.ATOM_PATH_ROOT || firstComponent) {
         // Query as a whole may have: root flag, set of path fragments
         var pq = new this();
         var j = i;

         if(ch == this.ATOM_PATH_ROOT) {
           firstComponent = Spah.SpahQL.Token.PathComponent.parseAt(j+1, query);
           if(!firstComponent) {
             this.throwParseErrorAt(j+1, query, "Found unexpected character '"+query.charAt(j+1)+"', expected TOKEN_PATH_COMPONENT");
           }
           // Valid root path, wind ahead and start chunking queries
           pq.useRoot = true;
         }
         j = firstComponent[0];
         pq.pathComponents.push(firstComponent[1]);
         
         // Start chunking into path segments
         var pathComponent;
         while(pathComponent = Spah.SpahQL.Token.PathComponent.parseAt(j, query)) {
           pq.pathComponents.push(pathComponent[1]);
           j = pathComponent[0];
         }
        return [j, pq];
      }     
      return null;
    }
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.SelectionQuery.prototype, Spah.SpahQL.Token.Base.prototype, {
    
    /**
     * Spah.SpahQL.Token.SelectionQuery#pathComponents -> Array Token.PathComponent
     *
     * Contains all path components that comprise this selection query, in the order in which they
     * were encountered during parsing.
     **/
    "pathComponents": [],
    
    /**
     * Spah.SpahQL.Token.SelectionQuery#useRoot -> Boolean
     *
     * A flag indicating whether or not this query is locked to the root data context.
     **/
    "useRoot": false,
    
    /**
     * new Spah.SpahQL.Token.SelectionQuery(pathComponents, useRoot)
     *
     * Instantiate a new selection query token with blank-slate values.
     **/
    "init": function(pathComponents, useRoot) {
      this.pathComponents = pathComponents || [];
      this.useRoot = useRoot || false;
    }
    
  });