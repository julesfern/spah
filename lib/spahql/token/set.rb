require File.join(File.dirname(__FILE__), 'base')
require File.join(File.dirname(__FILE__), '..', 'errors')

module Spah
  module SpahQL
    module Token
      
      # A token representing a standalone set literal.
      # Internal values are represented in their raw form - not as Token::String or any other complicating type.
      class Set < Base

        # The opening character for a set literal
        ATOM_SET_START = "{".freeze
        # The terminating character for a set literal
        ATOM_SET_END = "}".freeze
        # The delimiter for multi-value sets
        ATOM_SET_ARRAY_DELIMITER = ",".freeze
        # The delimter for range sets
        ATOM_SET_RANGE_DELIMITER = "..".freeze

        # An array of tokens found in this set
        attr_accessor :tokens
        # A boolean indicating whether or not the set is a range
        attr_accessor :is_range
        
        # Create a new token with blank-slate values
        def initialize(tokens=[], is_range=false)
          self.tokens = tokens
          self.is_range = is_range
        end
        
        # Detects a set literal at the given index in the given string query.
        # A set literal is composed of one or more string literals, numeric literals, boolean literals
        # or selection queries wrapped in the ATOM_SET_START and ATOM_SET_END character atoms. 
        # 
        # Within the set, selection queries are parsed and cached using parse_query. The ATOM_SET_ARRAY_DELIMITER
        # is used to separate values. Alternatively the ATOM_SET_RANGE_DELIMITER may be used to create a macro or
        # "range" set containing a numeric or alphabetic range. The two types of delimiters may not be mixed.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form [resumeIndex, foundToken], or nil if no token was found.
        def self.parse_at(i, query)
          ch = query[i, 1]
          if(ch == ATOM_SET_START)
            j = i+1
            tokens = []
            used_array_delimiter = false
            used_range_delimiter = false

            # Empty sets
            if(query[j, 1] == ATOM_SET_END)
               return [j+1, self.new]
            end#if: empty set

            # Populated sets - do the while/read_ahead thing
            read_result = nil
            while(read_result = Spah::SpahQL::QueryParser.read_ahead_token(j, query)) do
              allowed_tokens = [Spah::SpahQL::Token::Numeric, Spah::SpahQL::Token::String, Spah::SpahQL::Token::Boolean, Spah::SpahQL::Token::SelectionQuery]
              if(allowed_tokens.include?(read_result[1].class))
                # wind ahead
                j = read_result[0]
                # stash in set
                tokens << read_result[1]
                # find delimiter or closing bracket
                if(query[j, 1] == ATOM_SET_ARRAY_DELIMITER)
                  # found array delimiter
                  if(used_range_delimiter)
                    # Mixed delimiters, throw a wobbler
                    raise Spah::SpahQL::Errors::CompilerError.new(
                           j, query, 
                           "Found unexpected ATOM_SET_RANGE_DELIMITER, already used ATOM_SET_ARRAY_DELIMITER and delimiters may not be mixed."
                           )
                  end#if: used range delimiter when array delimiter used
                  used_array_delimiter = true
                  j += 1
                elsif(query[j, ATOM_SET_RANGE_DELIMITER.length] == ATOM_SET_RANGE_DELIMITER)
                  # found range delimiter
                  if(used_array_delimiter)
                    # mixed delimiters, throw wobbler
                    raise Spah::SpahQL::Errors::CompilerError.new(
                           j, query, 
                           "Found unexpected ATOM_SET_ARRAY_DELIMITER, already used ATOM_SET_RANGE_DELIMITER and delimiters may not be mixed."
                           )
                  end#if: used array delimiter when range delimiter used
                  used_range_delimiter = true
                  j += ATOM_SET_RANGE_DELIMITER.length
                elsif(query[j, 1] == ATOM_SET_END)
                  # end set
                  j += 1
                  break
                else
                  # dunno, throw toys out the pram
                  raise Spah::SpahQL::Errors::CompilerError.new(
                         j, query, 
                         "Found unexpected character #{query[j,1]}, expected ATOM_SET_ARRAY_DELIMITER, ATOM_SET_RANGE_DELIMITER or ATOM_SET_END"
                         )
                end#if: character match
              else
                raise Spah::SpahQL::Errors::CompilerError.new(
                       j, query, 
                       "Found unexpected #{t_type}, expected one of #{allowed_tokens.join(",")}"
                       )
              end#allowed tokens
            end#while: read tokens

            # Return match
            return [j, self.new(tokens, used_range_delimiter)];

          end#if: token match
          # No match
          return nil
        end
        
        # Equality helper for sets
        def ==(other_set)
          (other_set.is_a?(self.class)) and other_set.tokens == self.tokens and other_set.is_range == self.is_range
        end
        
      end
      
    end
  end
end