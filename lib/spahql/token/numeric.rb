require File.join(File.dirname(__FILE__), 'simple')

module Spah
  module SpahQL
    module Token
      
      # A token representing a standalone numeric literal
      class Numeric < Simple
        
        # A decimal point
        ATOM_NUMERIC_POINT = ".".freeze
        # The prefix for negative numbers
        ATOM_NUMERIC_NEGATIVE = "-".freeze
        
        # Detects numeric literals at the given index in the given string query.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
        def self.parse_at(i, query)
          ch = query[i,1]
          numreg = /\d/
          if(ch.match(numreg) or (ch == ATOM_NUMERIC_NEGATIVE and query[i+1,1].match(numreg)))
            j = 0; num = ch; point_found = false;
            while(true) do
              j += 1; ch = query[i+j, 1];
              if(query.length < i+j)
                # EOL
              elsif(ch == ATOM_NUMERIC_POINT)
                # found point
                if(point_found)
                  # Rewind and surrender
                  j -= 1
                  break
                else
                  point_found = true
                  num << ch
                end
              elsif(ch.match(numreg))
                # found more numerics, append to token
                num << ch
              else
                # found non-numeric
                break
              end #if: character match
            end#while
            return [i+j, self.new((point_found)? num.to_f : num.to_i)]
          end #if: token match
          # No match
          return nil
        end
        
      end
      
    end
  end
end