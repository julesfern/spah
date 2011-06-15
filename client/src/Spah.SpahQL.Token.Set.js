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
    }
    
  });