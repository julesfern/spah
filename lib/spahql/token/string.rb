require File.join(File.dirname(__FILE__), 'simple')
require File.join(File.dirname(__FILE__), '..', 'errors')

module Spah
  module SpahQL
    module Token
      
      # A token representing a standalone string literal
      class String < Simple
        
        # A single quote
        ATOM_QUOTE_SINGLE = "'".freeze
        # A double quote
        ATOM_QUOTE_DOUBLE = '"'.freeze
        # A string escape
        ATOM_ESCAPE = '\\'.freeze
        
        # Detects string literals at the given index in the given string query.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form \[resumeIndex, foundToken\], or nil if no token was found.
        def self.parse_at(i, query)
          ch = query[i,1]
          if(ch == ATOM_QUOTE_SINGLE or ch == ATOM_QUOTE_DOUBLE)
            quote_type = ch; j = 0; str = "";
            while(true) do
              # Run through until terminator found
              j += 1
              ch = query[i+j,1]
              if(query.length < i+j)
                # unexpected EOL
                raise Spah::SpahQL::Errors::CompilerError.new(
                      i+j, query, 
                      "Encountered EOL when expecting #{(quote_type==ATOM_QUOTE_SINGLE)? "ATOM_QUOTE_SINGLE" : "ATOM_QUOTE_DOUBLE"}"
                      )
              elsif(ch == quote_type)
                # string terminated
                j += 1
                break
              elsif(ch == ATOM_ESCAPE)
                # escape, skip ahead
                str << query[i+j+1, 1]
                j += 1;
              else
                # build string
                str << ch
              end #if: character match
            end #while
            return [i+j, self.new(str)]
          end #if: token match
          # No match
          return nil
        end
        
      end
      
    end
  end
end