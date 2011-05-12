/**
 * class Spah.State.QueryParser
 *
 * Parses string queries from data-\*-if attributes and client-side responders and produces parsed <code>Spah.State.Query</code> instances.
 * Maintains a cache of previously-parsed queries for speed.
 **/
 
 // Define and export
 Spah.State.QueryParser = function() {};
 window["Spah"]["State"]["QueryParser"] = Spah.State.QueryParser;
 
 // Singletons
 jQuery.extend(Spah.State.QueryParser, {
   
   /**
    * Spah.State.QueryParser.queryCache -> Object cached queries
    * Holds a cache of previously-parsed queries indexed by string representation.
    **/
   "queryCache": {},
   
   /**
    * Spah.State.QueryParser.dotProperties -> Array of allowed property calls
    **/
   dotProperties: ["last", "first", "size", "type"],
   
   /**
    * Spah.State.QueryParser.comparisonOperators -> Array of allowed comparators
    *
    * Allowed set comparison operators. Detection of an allowed comparator throws the
    * current subquery into "truthiness" mode, where it will return a boolean result
    * rather than a resultset.
    **/
   comparisonOperators: ["==", "~=", ">", "<", ">=", "<=", "!=", "}~{", "}>{", "}<{", "}!{"],
   
   // Atom configuration: strings
   ATOM_QUOTE_SINGLE: "'",
   ATOM_QUOTE_DOUBLE: '"',
   ATOM_ESCAPE: '\\',
   // Atom configuration: numerics
   ATOM_NUMERIC_POINT: ".",
   ATOM_NUMERIC_NEGATIVE: "-",
   // Atom configuration: bools
   ATOM_BOOLEAN_TRUE: "true",
   ATOM_BOOLEAN_FALSE: "false",
   // Atom configuration: sets
   ATOM_SET_START: "{",
   ATOM_SET_END: "}",
   ATOM_SET_DELIMITER: ",",
   ATOM_SET_RANGE_DELIMITER: "..",
   // Atom configuration: paths
   ATOM_PATH_DELIMITER: "/",
   ATOM_PATH_ROOT: "$",
   ATOM_FILTER_QUERY_START: "[",
   ATOM_FILTER_QUERY_END: "]",
   
   // States
   STATE_NULL: null,
   STATE_PATH_QUERY: "path",
   STATE_KEY_NAME: "key",
   STATE_PROPERTY: "prop",
   STATE_FILTER_QUERY: "filt",
   STATE_STRING_LITERAL: "str",
   STATE_NUMERIC_LITERAL: "num",
   STATE_BOOLEAN_LITERAL: "bool",
   STATE_SET_LITERAL: "set",
   
   
   /**
    * Spah.State.QueryParser.parseQuery(str) -> Spah.State.Query instance
    * - str (String): The string query e.g. "/foo/bar == 3"
    *
    * Parses a string query and returns a parsed <code>Spah.State.Query</code> instance.
    **/
   "parseQuery": function(str) {
      // Return cached query if found
      var query = str.replace(/\s/g, ""); // Strip spaces from query
      if(this.queryCache[query]) return this.queryCache[query];

      // Setup state for a fresh parse
      var i, ch, lch, nch; // Iterator and character buffers
      var tokenizerState = this.STATE_NULL;
      var stateStack = []; // Tokenizer state and token collector
      var token = ""; // The token currently being gathered
      
      // Setup entities expected in a query
      var primarySet, primaryQuery; // The left-hand objects, one of these MUST be true for the query to be a valid selection query
      var comparisonOperator; // Comparison operator, must be set if one of the primary objects is truthy and one of the secondary objects is truthy
      var secondarySet, secondaryQuery; // The right-hand objects
      
      // State manipulation macros
      var qp = this;
      var pushState = function(state) { stateStack.push(state); tokenizerState = state; };
      var popState = function() { stateStack.pop(); tokenizerState = ((stateStack.length<1)? qp.STATE_NULL : stateStack[stateStack.length-1]); };
      var inState = function(state) { return ((qp==this.STATE_NULL)? (stateStack.length==0) : (stateStack.indexOf(state) >= 0)); };
      var popDelegate = function() { popState(); i--;}; // Pops the state and rewinds the tokenizer so that the previous state may deal with it
      var delegateState = function(state) { pushState(state); i--;}; // Pushes a new state and rewinds
      
      // Token encountered macros
      var encounteredSetDelimiter = function(i, query) {
        if(!inState(qp.STATE_SET_LITERAL)) {
          qp.throwParseErrorAt(i, query, "Set delimiter encountered with no containing set brackets. Set delimiters may only be used in set literals, which must be wrapped in {mustaches}.");
        }
        else if(tokenizerState == qp.STATE_SET_LITERAL) {
          qp.throwParseErrorAt(i, query, "Unexpected delimiter found in set literal, expected any of TOKEN_PRIMITIVE_LITERAL, TOKEN_SELECTION_QUERY");
        }
        popDelegate();
      };
      
      // Set manipulation
      var openSet = function(i, query) {}; // error if already in set state
      var appendPrimitiveToSet= function(i, query, primitive) {}; // open a set if a set is not already open
      var closeSet = function(i, query) {}; // Commit to primary or secondary object. error if set not already open. error if pushing to secondary and no operator is defined.
      
      // Query manipulation
      var openQuery = function(i, query) {}; // Start a new query object
      var appendPathComponentToQuery = function(i, query, pathComponent) {}; // Push a path component to the current query
      var closeQuery = function(i, query) {}; // Commit the query to the primary or secondary object. error if pushing to secondary and no operator is defined.
     
      // Tokenize!
      // Prepare the query for injection
      var parsedQuery = new Spah.State.Query();
          parsedQuery.rawString = query;
     
      for(i=0; i<query.length; i++) {
        ch = query.charAt(i);
        lch = (i==0)? null : query.charAt(i-1);
        nch = (i==query.length-1)? null : query.charAt(i+1);
        
        switch(tokenizerState) {
          case this.STATE_PATH_QUERY:
            // may enter property (dot found), key name (alphanum, -, _ found)
            // may exit to null (comparator found), set literal (set delimiter found)
            break;
          case this.STATE_KEY_NAME:
            // may enter filter query (filter query start found)
            // may exit to path query (control character found: comparator (error if in set literal state), path delimiter, or set literal delimiter (error if NOT in set literal state))
            break;
          case this.STATE_PROPERTY:
            // no substates
            // may exit to path query (control character found: comparator, path delimiter, or set literal delimiter)
            break;
          case this.STATE_FILTER_QUERY:
            // no substates - custom read-ahead routine
            // may exit to path query (closing bracket found)
            break;
          case this.STATE_STRING_LITERAL: case this.STATE_NUMERIC_LITERAL: case this.STATE_BOOLEAN_LITERAL:
            // no substates.
            // may exit to set literal and null.
            
            // read ahead token end and stash token
            switch(tokenizerState) {
              case this.STATE_STRING_LITERAL:
                break;
              case this.STATE_NUMERIC_LITERAL:
                break;
              case this.STATE_BOOLEAN_LITERAL:
                break;
            }
            
            // if in set literal mode
              // append to existing set
              // expect set closure or set delimiter afterwards
            // if in primitive literal mode
              // open set
              // append
              // close set upon finding EOL or comparison operator
            
            break;
          case this.STATE_NULL: case this.STATE_SET_LITERAL:
            // NULL:
            // may encounter and parse comparison operator. comparison operators may ONLY be encountered legally
            // in this state. comparison operators encountered while under FILTER_QUERY or STRING_LITERAL states
            // are naturally ignored by this parser scope.
            // null state may enter any of string literal, numeric literal, boolean literal, set literal, path query
            // may not exit
            
            // SET LITERAL:
            // may enter string literal, path query, numeric literal, boolean literal
            // may exit to null
            
            if(ch == this.ATOM_PATH_ROOT || ch == this.ATOM_PATH_DELIMITER) {
              // Entering path query
              delegateState(this.STATE_PATH_QUERY); continue; 
            }
            else if(ch == this.ATOM_QUOTE_SINGLE || ch == this.ATOM_QUOTE_DOUBLE) {
              // Entering a string literal state
              delegateState(this.STATE_STRING_LITERAL); continue;
            } 
            else if(ch.match(/\d/)) {
              delegateState(this.STATE_NUMERIC_LITERAL); continue;
            }
            else if(query.substr(i,4) == this.ATOM_BOOLEAN_TRUE || query.substr(i, 5) == this.ATOM_BOOLEAN_FALSE) {
              delegateState(this.STATE_BOOLEAN_LITERAL); continue;
            }
            else if(ch == this.ATOM_SET_LITERAL_START) {
              // Entering a set literal. May not enter if already in set literal state.
              openState(i, query);
              pushState(this.STATE_SET_LITERAL); continue;
            }
            else if(ch == this.ATOM_SET_DELIMITER) {
              // Expecting a new literal in a set
              // Error if not in set literal state
              // Error if set already contained a range
            }
            else if((ch+nch).substr(i,2) == this.ATOM_SET_RANGE_DELIMITER) {
              // Expecting a final value in a set.
              // Error if not in set literal state
              // Error if set already contains multiple values
            }
            else if(ch == this.ATOM_SET_LITERAL_END) {
              // Closing the current set. 
              // Error if not in set literal state.
            }
            else if(this.atComparisonOperator(i, query)) {
              // Encountering comparison operator, expect single token query or set literal in prior token
              // and expect single token query or set literal in subsequent token
            }
            else {
              // Illegal character
              throw new Error("Unexpected character '"+ch+"' found at position '"+i+"' in query '"+query+"'");
            }
            break;
          default:
            throw new Error("Illegal tokenizer state: "+tokenizerState);
        }
     }
     // Push the final fragment onto the stack
     
     // Stash and return
     this.queryCache[query] = parsedQuery;
     Spah.log("Generated and cached query '"+str+"' ->", parsedQuery);
     return parsedQuery;
   },
   
   throwParseErrorAt: function(i, query, message) {
     throw new Error("Parse error: '+"(message||"failure")+"' at index "+i+" in query '"+query+"'.");
   },
   
   atComparisonOperator: function(i, query) { 
     return (qp.comparisonOperators.indexOf(query.substr(i,2)) >= 0 || qp.comparisonOperators.indexOf(query.substr(i,3)) >= 0); 
   },
   atSetDelimiter: function(i, query) {
     return (query.charAt(i) == qp.ATOM_SET_DELIMITER || query.substr(i,2) == qp.ATOM_SET_RANGE_DELIMITER);
   },
   
   // Reads the string literal ahead and returns the found string and a new index
   // or null if no string lit found at this index
   readAheadStringLiteral: function(i, query) {
     var ch = query.charAt(i);
     if(ch == this.ATOM_QUOTE_SINGLE || ch == this.ATOM_QUOTE_DOUBLE) {
       var j = 0;       
       var quoteType = ch;
       var str = "";
       while(true) {
         j++;
         if(query.length < i+j) {
           this.throwParseErrorAt(i, query, "Encountered EOL when expecting "+((quoteType==this.ATOM_QUOTE_SINGLE)? "ATOM_QUOTE_SINGLE":"ATOM_QUOTE_DOUBLE"));
         }
         else if(query.charAt(i+j) == quoteType) {
           j++; break;
         }
         else if(query.charAt(i+j) == this.ATOM_ESCAPE) {
           // Found escape, append next char
           str+=query.charAt(i+j+1);
           j++;
         }
         else {
           str += query.charAt(i+j);
         }
       }
       return [i+j, str];
     }
     else {
      return null; 
     }
   },
   // As readAheadStringLiteral but for integer and floating-point numbers
   readAheadNumericLiteral: function(i, query) {
     var ch = query.charAt(i);
     var numReg = /\d/;
     if(ch.match(numReg) || (ch==this.ATOM_NUMERIC_NEGATIVE && query.charAt(i+1).match(numReg))) {
       var num = ch;
       var pointFound;
       var j = 0;
       while(true) {
          j++;
          if(query.length < i+j) {
            break; // EOL
          }
          else if(query.charAt(i+j) == this.ATOM_NUMERIC_POINT) {
            if(pointFound) {
              this.throwParseErrorAt(i+j, query, "Found ATOM_NUMERIC_POINT multiple times in the same numeric literal. Only one instance of this atom is allowed per numeric literal.");
            }
            else {
              pointFound = true;
              num += query.charAt(i+j);
            }
          }
          else if(query.charAt(i+j).match(numReg)) {
            // Found another numeric char
            num += query.charAt(i+j);
          }
          else {
            break;
          }
       }
       return [i+j, (pointFound ? parseFloat(num) : parseInt(num))];
     }
     else {
       return null;
     }
   },
   
   readAheadBooleanLiteral: function(i, query) {
     if(query.substr(i,this.ATOM_BOOLEAN_TRUE.length) == this.ATOM_BOOLEAN_TRUE) return [i+this.ATOM_BOOLEAN_TRUE.length, true];
     else if(query.substr(i,this.ATOM_BOOLEAN_FALSE.length) == this.ATOM_BOOLEAN_FALSE) return [i+this.ATOM_BOOLEAN_FALSE.length, false];
     else return null;
   },
   
   "newQueryFragment": function() {
     // key: null if no match requred, string if exact match, regexp if partial match
     // scopeToSubtree: is the query scoped to the previous subtree, or the root of the data construct?
     // recursive: set to true to deep-search for this path
     // filterQueries: array of filters through which each item in the current scope must pass.
     // isAssertion: true if the fragment is assertive (followed by a comparator)
     return {key: null, scopeToSubtree: true, recurse: false, filterQueries: [], isAssertion: false};
   }
   
 });