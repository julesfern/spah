require File.join(File.dirname(__FILE__), 'simple')
require File.join(File.dirname(__FILE__), '..', 'errors')

module Spah
  module SpahQL
    module Token
      
      # A key name is an inline reference comprised of valid variable name characters, including letters, underscores and numbers.
      class FilterQuery < Simple
        
        # The opening character for an inline filter query
        ATOM_FILTER_QUERY_START = "[".freeze
        # The terminating character for an inline filter query
        ATOM_FILTER_QUERY_END = "]".freeze
        
        # Detects a filter query at the given index in the given string query.
        # A filter query is a selection or assertion query wrapped in the ATOM_FILTER_QUERY_START and
        # ATOM_FILTER_QUERY_END character atoms and is parsed as an independent using parse_query. 
        # 
        # This has the benefit of putting filter queries into the pre-parsed query cache.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
        def self.parse_at(i, query)
          ch = query[i,1]
          if(ch == ATOM_FILTER_QUERY_START)
            j = i+1; depth = 1; query_token = "";

            while(depth > 0) do
              ch = query[j,1]
              if(j > query.length)
                raise Spah::SpahQL::Errors::CompilerError.new(
                       j, query, 
                       "Found unexpected EOL, expected ATOM_FILTER_QUERY_END. (Bracket depth: #{depth})"
                       )
              elsif(ch == ATOM_FILTER_QUERY_START)
                depth += 1; query_token << ch; j += 1;
              elsif(ch == ATOM_FILTER_QUERY_END)
                depth -= 1; j += 1;
                break if(depth == 0)
                query_token << ch; 
              elsif(string_result = Spah::SpahQL::Token::String.parse_at(j, query))
                # String literals - we use the internal string reader as it will ignore any square brackets within the quote marks.
                # The resume index is used to bulk-append the characters to the query token
                query_token += query[j..string_result[0]-1]
                j = string_result[0]
              else
                # Regular append
                query_token << ch
                j += 1
              end
            end#while: depth

            if(query_token.length > 0) # query token does not include final closing bracket
               return [j, self.new(Spah::SpahQL::QueryParser.parse_query(query_token))]
            else
             raise Spah::SpahQL::Errors::CompilerError.new(
                   j, query, 
                   "Found unexpected ATOM_FILTER_QUERY_END, expected TOKEN_SELECTION_QUERY or TOKEN_ASSERTION_QUERY. Looked like those brackets were empty - make sure they have a query in them."
                   )
            end#if: token length

          end#if: token match
          # No match
          return nil
        end
        
      end
      
    end
  end
end