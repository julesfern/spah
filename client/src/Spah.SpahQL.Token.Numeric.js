/**
 * class Spah.SpahQL.Token.Numeric < Spah.SpahQL.Token.Simple
 *
 * A simple token wrapping an integer or floating-point numeric literal value.
 **/
 
  // Define and export
  Spah.SpahQL.Token.Numeric = function(value) { this.init(value) };
  window["Spah"]["SpahQL"]["Token"]["Numeric"] = Spah.SpahQL.Token.Numeric;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.Numeric, Spah.SpahQL.Token.Simple, {
    
    // Atom configuration: numerics
    ATOM_NUMERIC_POINT: ".",
    ATOM_NUMERIC_NEGATIVE: "-",
    
    /**
     * Spah.SpahQL.Token.Numeric.parseAt(i, query) -> Array\[resumeIndex, foundToken\] or null
     *
     * Identifies a numeric literal at the given index in the given string query and returns null
     * if no token is identified, or a tuple of terminating index and the instantiated token if successful.
     **/
    "parseAt": function(i, query) {
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
         return [i+j, new this(pointFound ? parseFloat(num) : parseInt(num, 10))];
       }
       else {
         return null;
       }
    }
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.Numeric.prototype, Spah.SpahQL.Token.Simple.prototype, {
    
  });