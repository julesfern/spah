/**
 * class Spah.SpahQL.QueryParser
 *
 * Parses string queries from data-\*-if attributes and client-side responders and produces parsed <code>Spah.SpahQL.Query</code> instances.
 * Maintains a cache of previously-parsed queries for speed.
 **/
 
 // Define and export
 Spah.SpahQL.QueryParser = function() {};
 window["Spah"]["SpahQL"]["QueryParser"] = Spah.SpahQL.QueryParser;
 
 // Singletons
 jQuery.extend(Spah.SpahQL.QueryParser, {
   
   /**
    * Spah.SpahQL.QueryParser.queryCache -> Object cached queries
    * Holds a cache of previously-parsed queries indexed by string representation.
    **/
   "queryCache": {},
   
   /**
    * Spah.SpahQL.QueryParser.dotProperties -> Array of allowed property calls
    **/
   dotProperties: ["explode", "size", "type"],
   
   /**
    * Spah.SpahQL.QueryParser.comparisonOperators -> Array of allowed comparators
    *
    * Allowed set comparison operators. Detection of an allowed comparator throws the
    * current subquery into "truthiness" mode, where it will return a boolean result
    * rather than a resultset.
    **/
   comparisonOperators: ["==", "=~", ">", "<", ">=", "<=", "!=", "}~{", "}>{", "}<{", "}!{"],
   COMPARISON_STRICT_EQUALITY: "==",
   COMPARISON_ROUGH_EQUALITY: "=~",
   COMPARISON_INEQUALITY: "!=",
   COMPARISON_LT: "<",
   COMPARISON_GT: ">",
   COMPARISON_LTE: "<=",
   COMPARISON_GTE: ">=",
   COMPARISON_JOINT_SET: "}~{",
   COMPARISON_SUPERSET: "}>{",
   COMPARISON_SUBSET: "}<{",
   COMPARISON_DISJOINT_SET: "}!{",

   
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
   ATOM_SET_ARRAY_DELIMITER: ",",
   ATOM_SET_RANGE_DELIMITER: "..",
   // Atom configuration: paths
   ATOM_PATH_DELIMITER: "/",
   ATOM_PATH_ROOT: "$",
   ATOM_FILTER_QUERY_START: "[",
   ATOM_FILTER_QUERY_END: "]",
   ATOM_PROPERTY_IDENTIFIER: ".",
   ATOM_PATH_WILDCARD: "*",
   
   // Tokens
   TOKEN_STRING_LITERAL: "TOKEN_STRING_LITERAL",
   TOKEN_NUMERIC_LITERAL: "TOKEN_NUMERIC_LITERAL",
   TOKEN_BOOLEAN_LITERAL: "TOKEN_BOOLEAN_LITERAL",
   TOKEN_SET_LITERAL: "TOKEN_SET_LITERAL",
   TOKEN_SELECTION_QUERY: "TOKEN_SELECTION_QUERY",
   TOKEN_COMPARISON_OPERATOR: "TOKEN_COMPARISON_OPERATOR",
   
   
   /**
    * Spah.SpahQL.QueryParser.parseQuery(str) -> Spah.SpahQL.Query instance
    * - str (String): The string query e.g. "/foo/bar == 3"
    *
    * Parses a string query and returns a parsed <code>Spah.SpahQL.Query</code> instance.
    *
    * Uses control characters such as set openers, comparison operators and path delimiters to throw the
    * tokenizer into a variety of states. The actual parsing of each token is handed by a set of functions
    * with naming convention readAhead, e.g. <code>readAheadStringLiteral</code>. These methods are
    * responsible for identifying the token, reading ahead to parse it, and returning the found object
    * to the tokenizer along with an updated index at which the tokenizer may resume parsing.
    **/
   "parseQuery": function(str) {
      // Return cached query if found
      var query = str.replace(/\s/g, ""); // Strip spaces from query
      if(this.queryCache[query]) return this.queryCache[query];
      // Create query instance
      var parsedQuery = new Spah.SpahQL.Query();
          parsedQuery.rawString = str;
      
      // Pull tokens from the query. Expecting (TOKEN_SELECTOR_QUERY|TOKEN_SET_LITERAL)[,TOKEN_COMPARISON_OPERATOR,(TOKEN_SELECTOR_QUERY|TOKEN_SET_LITERAL)]
      var readAheadResult;
      var i = 0;
      while(readAheadResult = this.readAheadToken(i, query)) {
        switch(readAheadResult.tokenType) {
          case this.TOKEN_NUMERIC_LITERAL: 
          case this.TOKEN_STRING_LITERAL:  
          case this.TOKEN_BOOLEAN_LITERAL:
          case this.TOKEN_SELECTION_QUERY: 
          case this.TOKEN_SET_LITERAL:
            if(([this.TOKEN_NUMERIC_LITERAL, this.TOKEN_STRING_LITERAL, this.TOKEN_BOOLEAN_LITERAL]).indexOf(readAheadResult.tokenType) > -1) {
              // Transpose raw literal into set
              readAheadResult.token = {type: this.TOKEN_SET_LITERAL, values: [readAheadResult.token], isRange: false};
              readAheadResult.tokenType = this.TOKEN_SET_LITERAL;
            }
            // Take set literal or selection query and push to main query object
            if(parsedQuery.primaryToken) {
              if(parsedQuery.comparisonOperator) {
                if(parsedQuery.secondaryToken) {
                  this.throwParseErrorAt(i, query, "Unexpected "+readAheadResult.tokenType+", expected EOL");
                }
                else {
                  parsedQuery.secondaryToken = readAheadResult.token;
                }
              }
              else {
                this.throwParseErrorAt(i, query, "Unexpected "+readAheadResult.tokenType+", expected EOL or TOKEN_COMPARISON_OPERATOR");
              }
            }
            else {
              parsedQuery.primaryToken = readAheadResult.token;
            }
          
            // Push to primary or secondary
            break;
          case this.TOKEN_COMPARISON_OPERATOR:
            if(parsedQuery.comparisonOperator) {
              this.throwParseAt(i, query, "Found unexpected TOKEN_COMPARISON_OPERATOR, expected EOL");
            }
            else {
              parsedQuery.comparisonOperator = readAheadResult.token;
              parsedQuery.assertion = true;
            }
            break;
          default:
            this.throwParseErrorAt(i, query, "Found unexpected token "+readAheadResult.tokenType+".");
        }
        i = readAheadResult.resumeAt;
      }
      
     // Stash and return
     this.queryCache[query] = parsedQuery;
     Spah.log("Generated and cached query '"+str+"' ->", parsedQuery);
     return parsedQuery;
   },
   
   throwParseErrorAt: function(i, query, message) {
     throw new Error("Parse error: '"+(message||"failure")+"' at index "+i+" in query '"+query+"'.");
   },
   
   /**
    * Spah.SpahQL.QueryParser.readAheadToken(i, query) -> Object token descriptor
    * - i (Number): The index at which to start reading the string
    * - query (String): The raw string of the query
    * 
    * Reads ahead through the given query string, starting at the current index, to identify the token at the given index.
    * Returns an Array <code>{resumeAt, token, tokenType}</code> where <code>index</code> is the index at which the found token
    * concludes, and at which the expression parser should resume.
    * 
    * Returns <code>null</code> if no valid tokens are found.
    **/
   readAheadToken: function(i, query) {
     var r, tType;
     
     if(r = this.readAheadComparisonOperator(i, query)) tType = this.TOKEN_COMPARISON_OPERATOR;
     else if(r = this.readAheadStringLiteral(i, query)) tType = this.TOKEN_STRING_LITERAL;
     else if(r = this.readAheadNumericLiteral(i, query)) tType = this.TOKEN_NUMERIC_LITERAL;
     else if(r = this.readAheadBooleanLiteral(i, query)) tType = this.TOKEN_BOOLEAN_LITERAL;
     else if(r = this.readAheadSetLiteral(i, query)) tType = this.TOKEN_SET_LITERAL;
     else if(r = this.readAheadSelectionQuery(i, query)) tType = this.TOKEN_SELECTION_QUERY;
     
     return (r)? {resumeAt: r[0], token: r[1], tokenType: tType} : null;
   },
   
   readAheadComparisonOperator: function(i, query) { 
     if(this.comparisonOperators.indexOf(query.substr(i,3)) >= 0)  return [i+3, query.substr(i,3)];
     else if(this.comparisonOperators.indexOf(query.substr(i,2)) >= 0) return [i+2, query.substr(i,2)];
     else if(this.comparisonOperators.indexOf(query.substr(i,1)) >= 0) return [i+1, query.substr(i,1)];
     else return null;
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
              // rewind and surrender
              j--;
              break;
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
       return [i+j, (pointFound ? parseFloat(num) : parseInt(num, 10))];
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
   
   readAheadSetLiteral: function(i, query) {
     if(query.charAt(i) == this.ATOM_SET_START) {
       var j=i+1;
       var tokens=[];
       var usedArrayDelimiter = false
       var usedRangeDelimiter = false;
       var readResult;
       
       if(query.charAt(j) == this.ATOM_SET_END) {
         return [j+1, {type: this.TOKEN_SET_LITERAL, values: tokens, isRange: usedRangeDelimiter}]; // Empty set
       }
       
       while(readResult = this.readAheadToken(j, query)) {
         var tType = readResult.tokenType;
         var allowedTokens = [this.TOKEN_NUMERIC_LITERAL, this.TOKEN_STRING_LITERAL, this.TOKEN_BOOLEAN_LITERAL, this.TOKEN_SELECTION_QUERY];
         if(allowedTokens.indexOf(tType) >= 0) {
           // wind ahead
           j = readResult.resumeAt;
           // push token into set
           tokens.push(readResult.token);
           // find delimiter
           if(query.charAt(j) == this.ATOM_SET_ARRAY_DELIMITER) {
             if(usedRangeDelimiter) {
               this.throwParseErrorAt(j, query, "Found unexpected ATOM_SET_ARRAY_DELIMITER in set literal that already used the range delimiter.");
             }
             usedArrayDelimiter = true; j++;
           }
           else if(query.substr(j, this.ATOM_SET_RANGE_DELIMITER.length) == this.ATOM_SET_RANGE_DELIMITER) {
             if(usedArrayDelimiter) {
               this.throwParseErrorAt(j, query, "Found unexpected ATOM_SET_RANGE_DELIMITER in set literal that already used the array delimiter.");
             }
             usedRangeDelimiter = true; j+=this.ATOM_SET_RANGE_DELIMITER.length;
           }
           else if(query.charAt(j) == this.ATOM_SET_END) {
             j++; break;
           }
           else {
             this.throwParseErrorAt(j, query, "Found unexpected character '"+query.charAt(j)+"' in set literal, expecting one of ATOM_SET_ARRAY_DELIMITER, ATOM_SET_RANGE_DELIMITER, ATOM_SET_END.");
           }
         }
         else {
           this.throwParseErrorAt(j, query,  "Found unexpected "+tType+" in set literal. Set literals may only contain "+allowedTokens.join(","));
         }
       }
       return [j, {type: this.TOKEN_SET_LITERAL, values: tokens, isRange: usedRangeDelimiter}];
     }
     return null;
   },
   
   // Reads ahead in the string at the given index and returns the index at which to resume
   // and the found set of path fragments
   readAheadSelectionQuery: function(i, query) {
     var ch = query.charAt(i);
     if(ch == this.ATOM_PATH_ROOT || ch == this.ATOM_PATH_DELIMITER) {
       // Going to return query
        // Query as a whole may have: root flag, set of path fragments
        // Each fragment may have: recursion flag, key OR property name, filter queries if using key name and not property name
        var pq = {useRoot: false, pathComponents: [], type: this.TOKEN_SELECTION_QUERY};
        var j = i;
       
        if(ch == this.ATOM_PATH_ROOT) {
          if(query.charAt(i+1) != this.ATOM_PATH_DELIMITER) {
            this.throwParseErrorAt(i+1, query, "Found unexpected character '"+query.charAt(i+1)+"', expected ATOM_PATH_DELIMITER");
          }
          // Valid root path, wind ahead and start chunking queries
          pq.useRoot = true;
          j++;
        }
        
        // Start chunking into path segments
        var pathComponent;
        while(pathComponent = this.readAheadPathComponent(j, query)) {
          pq.pathComponents.push(pathComponent[1]);
          j = pathComponent[0];
        }
       return [j, pq];
     }     
     return null;
   },
   
   
   
   // Reads ahead until the next slash or control character is found. Path component is /foo, //foo, //foo[query][query]
   readAheadPathComponent: function(i, query) {
     if(query.charAt(i) == this.ATOM_PATH_DELIMITER) {
       var j = i+1;
       var pc = {key: null, property: null, recursive: false, filterQueries: []};
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
        var kReadResult = this.readAheadInlineVariableReference(j, query);
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
       while(fReadResult = this.readAheadFilterQuery(j, query)) {
         pc.filterQueries.push(fReadResult[1]);
         j = fReadResult[0];
       }
       
       // When out of filters, exit       
       return [j, pc]
     }
     
     return null;
   },
   
   // Reads ahead until matching closing ATOM_FILTER_QUERY_END is found
   readAheadFilterQuery: function(i, query) {
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
           scopeDepth--; queryToken += ch; j++;
         }
         else if(strReadAheadResult = this.readAheadStringLiteral(j, query)) {
           queryToken += query.substring(j,strReadAheadResult[0]); j = strReadAheadResult[0];
         }
         else {
           queryToken += ch; j++;
         }         
       }
       if(queryToken.length > 1) { // query token includes final closing bracket
         return [j, this.parseQuery(queryToken.substr(0, queryToken.length-1))];
       }
       else {
         this.throwParseErrorAt(j, query, "Found unexpected ATOM_FILTER_QUERY_END, expected TOKEN_SELECTION_QUERY or TOKEN_ASSERTION_QUERY. Looked like those brackets were empty - make sure they have a query in them.");
       }
     }
     return null;
   },
   
   // Reads ahead for alphanumeric, underscore and hyphen characters
   readAheadInlineVariableReference: function(i, query) {
     var valid = /[\w\d_-]/;
     var j=i; var token = "";
     var m;
     while(m = query.charAt(j).match(valid)) {
       token += m[0]; j++;
     }
     return (token.length > 0)? [j, token] : null;
   }   
 });