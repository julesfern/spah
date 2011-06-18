/**
 * class Spah.SpahQL.Token.Set < Spah.SpahQL.Token.Base
 *
 * A wrappping class for any set literal, containing one or more values.
 * May qualify as a range if the range operator is used during parsing.
 **/
 
  // Define and export
  Spah.SpahQL.Token.Set = function(tokens, isRange) { this.init(tokens, isRange); };
  window["Spah"]["SpahQL"]["Token"]["Set"] = Spah.SpahQL.Token.Set;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.Set, Spah.SpahQL.Token.Base, {

    // Atom configuration: sets
    ATOM_SET_START: "{",
    ATOM_SET_END: "}",
    ATOM_SET_ARRAY_DELIMITER: ",",
    ATOM_SET_RANGE_DELIMITER: "..",
    
    /**
     * Spah.SpahQL.Token.Set.parseAt(index, queryString) -> Array result or null
     *
     * Reads the given queryString starting at the given index and attempts to identify and parse
     * a set literal token. If found, the token will be returned in a tuple \[resumeIndex, foundToken\]. 
     * Returns null if nothing is found.
     **/
    "parseAt": function(i, query) {
      if(query.charAt(i) == this.ATOM_SET_START) {
        var j=i+1;
        var tokens=[];
        var usedArrayDelimiter = false
        var usedRangeDelimiter = false;
        var readResult;

        if(query.charAt(j) == this.ATOM_SET_END) {
          return [j+1, new this()]; // Empty set
        }

        while(readResult = Spah.SpahQL.Token.parseAt(j, query)) {
          var token = readResult[1];
          var allowedTokens = [Spah.SpahQL.Token.Numeric, Spah.SpahQL.Token.String, Spah.SpahQL.Token.Boolean, Spah.SpahQL.Token.SelectionQuery];
          var tokenIsAllowed = false;
          for(var i in allowedTokens) {
            var klass = allowedTokens[i];
            if(token instanceof klass) {
              tokenIsAllowed = true;
              break;
            }
          }
          
          if(tokenIsAllowed) {
            // wind ahead
            j = readResult[0];
            // push token into set
            tokens.push(token);
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
            this.throwParseErrorAt(j, query,  "Found unexpected token in set literal. Set literals may only contain string, numeric, boolean and selection query values.");
          }
        }
        return [j, new this(tokens, usedRangeDelimiter)];
      }
      return null;
    }
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.Set.prototype, Spah.SpahQL.Token.Base.prototype, {
    
    /**
     * Spah.SpahQL.Token.Set#tokens -> Array Token
     *
     * Contains all tokens included in this set, in the order in which they were encountered.
     **/
    "tokens": [],
    
    /**
     * Spah.SpahQL.Token.Set#isRange -> Boolean
     *
     * A flag indicating whether or not this token is to be evaluated as a range.
     **/
    "isRange": false,
    
    /**
     * new Spah.SpahQL.Token.Set(value)
     *
     * Instantiate a new set token with the given list of tokens.
     **/
    "init": function(tokens, isRange) {
      this.tokens = tokens || [];
      this.isRange = isRange || false;
    },
    
    /**
     * Spah.SpahQL.Token.Set#evaluate(rootData[, scopeData, scopePath]) -> Array of QueryResults
     * - rootData (Object): A root data context for any selection queries that appear in the literal
     * - scopeData (Object): A scoped data context for the scope at which selection queries in the set will be evaluated.
     * - scopePath (String): The string path at which the scopeData is located in the overall rootData construct.
     *
     * Evaluates a set literal, for use when a set is used in a selection query and must be returned as a set of results.
     * If the set is a range, it will be flattened into a set of values.
     **/
    evaluate: function(rootData, scopeData, scopePath) {
      var results = [];
      if(this.isRange) {
        
        // Break if tokens look suspicious
        if(this.tokens.length != 2) {
          this.throwRuntimeError(this, "Tried to evaluate range with "+this.tokens.length+" tokens, expected 2 tokens. Tokens: "+this.tokens.join(", "));
        }
        
        var startResults = this.tokens[0].evaluate(rootData, scopeData, scopePath);
        var endResults = this.tokens[1].evaluate(rootData, scopeData, scopePath);
      
        // Break if evaluation of either token returns no results
        if(startResults.length == 0 || endResults.length == 0) return results;
        
        var start = startResults[0].value;
        var end = endResults[0].value;
        var sType = Spah.SpahQL.DataHelper.objectType(start);
        var eType = Spah.SpahQL.DataHelper.objectType(end);
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
        for(var i in this.tokens) {
          var token = this.tokens[i];
          results = results.concat(token.evaluate(rootData, scopeData));
        }
      }
      return results;
    },

    /**
     * Spah.SpahQL.Token.Set#evalNumericRange(start, end) -> Array of QueryResults
     * - start (Number): The number at the start of the range (10 is the start value for {10..8})
     * - end (Number): The number at the start of the range (8 is the end value for {10..8})
     *
     * Evaluates a numeric range literal, generating an array of QueryResults containing all values in the range.
     **/
    evalNumericRange: function(start, end) {
      var results = [];
      var i = start;
      var d = (start>=end)? -1 : 1;
      while(true) {
        results.push(new Spah.SpahQL.QueryResult(null, i));
        i = i+d;
        if((d < 0 && i < end) || (d > 0 && i > end)) {
          break;
        }
      }
      return results;
    },

    /**
     * Spah.SpahQL.Token.Set#evalStringRange(start, end) -> Array of QueryResults
     * - start (String): The character at the start of the range ("a" is the start value for {'a'..'c'})
     * - end (String): The character at the end of the range ("c" is the end value for {'a'..'c'})
     *
     * Evaluates a string range literal, generating an array of QueryResults containing all values in the range.
     * String range literals are evaluated as numeric ranges using a radix of 35, and transposing the generated numeric values 
     * back into strings before returning them.
     **/
    evalStringRange: function(start, end) {
      var results = [];
      var radix = 35;
      var s = parseInt(start, radix); var e = parseInt(end, radix);
      var i = s;
      var d = (s>=e)? -1 : 1;
      while(true) {
        results.push(new Spah.SpahQL.QueryResult(null, i.toString(radix)));
        i = i+d;
        if((d < 0 && i < e) || (d > 0 && i > e)) {
          break;
        }
      }
      return results;
    },
    
  });