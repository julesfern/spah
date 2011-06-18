/**
 * class Spah.SpahQL.Token.FilterQuery < Spah.SpahQL.Token.Simple
 *
 * A token describing any path component within a selection query, comprised of one or two path delimiters
 * followed by a key or property name and an optional set of filter query tokens.
 **/
 
  // Define and export
  Spah.SpahQL.Token.FilterQuery = function(value) { this.init(value) };
  window["Spah"]["SpahQL"]["Token"]["FilterQuery"] = Spah.SpahQL.Token.FilterQuery;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.FilterQuery, Spah.SpahQL.Token.Simple, {

    // Atom configuration: paths
    ATOM_FILTER_QUERY_START: "[",
    ATOM_FILTER_QUERY_END: "]",
    
    /**
     * Spah.SpahQL.Token.FilterQuery.parseAt(index, queryString) -> Array result or null
     *
     * Reads the given queryString starting at the given index and attempts to identify and parse
     * a filter query token. If found, the token will be returned in a tuple \[resumeIndex, foundToken\]. 
     * Returns null if nothing is found.
     **/
    "parseAt": function(i, query) {
      if(query.charAt(i) == this.ATOM_FILTER_QUERY_START) {
        var j=i+1;
        var scopeDepth=1;
        var queryToken="";
        var strReadAheadResult;
        while(scopeDepth>0) {
          var ch=query.charAt(j); var strReadResult;
          if(ch == this.ATOM_FILTER_QUERY_START) {
            scopeDepth++; queryToken += ch; j++;
          }
          else if(ch == this.ATOM_FILTER_QUERY_END) {
            scopeDepth--; j++;
            if(scopeDepth == 0) break;
            queryToken += ch;
          }
          else if(strReadAheadResult = Spah.SpahQL.Token.String.parseAt(j, query)) {
            queryToken += query.substring(j,strReadAheadResult[0]); j = strReadAheadResult[0];
          }
          else {
            queryToken += ch; j++;
          }         
        }
        if(queryToken.length > 0) { // query token does not include final closing bracket
          return [j, new this(Spah.SpahQL.QueryParser.parseQuery(queryToken))];
        }
        else {
          this.throwParseErrorAt(j, query, "Found unexpected ATOM_FILTER_QUERY_END, expected TOKEN_SELECTION_QUERY or TOKEN_ASSERTION_QUERY. Looked like those brackets were empty - make sure they have a query in them.");
        }
      }
      return null;
    }
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.FilterQuery.prototype, Spah.SpahQL.Token.Simple.prototype, {
    
    /**
     * Spah.SpahQL.Token.FilterQuery#evaluate(rootData, scopeData, path) -> Boolean
     * - rootData (Object): The entire root-level data structure being queried
     * - scopeData (Object): The data for the scope at which this query is being executed.
     *
     * Evaluates this filter query as an assertion.
     **/
    "evaluate": function(rootData, scopeData) {
      return Spah.SpahQL.QueryRunner.assert(this.value, rootData, scopeData);
    }
    
  });