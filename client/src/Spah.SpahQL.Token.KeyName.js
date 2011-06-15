/**
 * class Spah.SpahQL.Token.KeyName < Spah.SpahQL.Token.Simple
 *
 * A simple token wrapping a valid variable or identifier value.
 **/
 
  // Define and export
  Spah.SpahQL.Token.KeyName = function(value) { this.init(value) };
  window["Spah"]["SpahQL"]["Token"]["KeyName"] = Spah.SpahQL.Token.KeyName;
  
  // Singletons
  jQuery.extend(Spah.SpahQL.Token.KeyName, Spah.SpahQL.Token.Simple, {
    
    /**
     * Spah.SpahQL.Token.KeyName.parseAt(i, query) -> Array\[resumeIndex, foundToken\] or null
     *
     * Identifies a keyname identifier at the given index in the given string query and returns null
     * if no token is identified, or a tuple of terminating index and the instantiated token if successful.
     **/
    "parseAt": function(i, query) {
      var valid = /[\w\d_-]/;
      var j=i; var token = "";
      var m;
      while(m = query.charAt(j).match(valid)) {
        token += m[0]; j++;
      }
      return (token.length > 0)? [j, new this(token)] : null;
    }
    
  });
  
  // Instance methods
  jQuery.extend(Spah.SpahQL.Token.KeyName.prototype, Spah.SpahQL.Token.Simple.prototype, {
    
  });