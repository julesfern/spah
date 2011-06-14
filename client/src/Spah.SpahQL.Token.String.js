/**
 * class Spah.SpahQL.Token.String < Spah.SpahQL.Token.Simple
 *
 * A simple token wrapping a string literal value.
 **/
 
  // Define and export
  Spah.SpahQL.Token.String = function(value) { this.init(value) };
  window["Spah"]["SpahQL"]["Token"]["String"] = Spah.SpahQL.Token.String;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.String, Spah.SpahQL.Token.Simple, {
    
    // Atom configuration: strings
    ATOM_QUOTE_SINGLE: "'",
    ATOM_QUOTE_DOUBLE: '"',
    ATOM_ESCAPE: '\\',
    
    /**
     * Spah.SpahQL.Token.String.parseAt(i, query) -> Array[resumeIndex, foundToken] or null
     *
     * Identifies a string literal at the given index in the given string query and returns null
     * if no token is identified, or a tuple of terminating index and the instantiated token if successful.
     **/
    "parseAt": function(i, query) {
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
        return [i+j, new this(str)];
      }
      else {
        return null; 
      }
    }
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.String.prototype, Spah.SpahQL.Token.Simple.prototype, {
    
  });