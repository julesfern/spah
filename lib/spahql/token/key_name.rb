require File.join(File.dirname(__FILE__), 'simple')

module Spah
  module SpahQL
    module Token
      
      # A key name is an inline reference comprised of valid variable name characters, including letters, underscores, dashes and numbers.
      class KeyName < Simple
        
        # Detects valid key or variable names at the given index in the given string query.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form \[resumeIndex, foundToken\], or nil if no token was found.
        def self.parse_at(i, query)
           valid = /[\w\d_-]/; j=i; token = "";
           m = nil
           while(m = query[j,1].match(valid)) do
             token += m[0]
             j += 1
           end#while
           return (token.length > 0)? [j, self.new(token)] : nil;
        end
        
      end
      
    end
  end
end