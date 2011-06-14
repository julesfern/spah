require File.join(File.dirname(__FILE__), 'simple')

module Spah
  module SpahQL
    module Token
      
      # A boolean true
      ATOM_BOOLEAN_TRUE = "true".freeze
      # A boolean false
      ATOM_BOOLEAN_FALSE = "false".freeze
      
      # A token representing a standalone boolean literal
      class Boolean < Simple
        
        # Detects boolean literals at the given index in the given string query.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
        def self.parse_at(i, query)
          return [i+ATOM_BOOLEAN_TRUE.length, self.new(true)] if(query[i, ATOM_BOOLEAN_TRUE.length] == ATOM_BOOLEAN_TRUE) 
          return [i+ATOM_BOOLEAN_FALSE.length, self.new(false)] if(query[i, ATOM_BOOLEAN_FALSE.length] == ATOM_BOOLEAN_FALSE)
          return nil
        end
        
      end
      
    end
  end
end