require File.join(File.dirname(__FILE__), 'simple')

module Spah
  module SpahQL
    module Token
      
      # A simple token type wrapping a comparison operator.
      class ComparisonOperator < Simple
        
        # The strict equality operator as used in the parser
        COMPARISON_STRICT_EQUALITY = "==".freeze
        # The rough equality operator as used in the parser
        COMPARISON_ROUGH_EQUALITY = "=~".freeze
        # The inequality operator as used in the parser
        COMPARISON_INEQUALITY = "!=".freeze
        # The less than operator as used in the parser
        COMPARISON_LT = "<".freeze
        # The greater than operator as used in the parser
        COMPARISON_GT = ">".freeze
        # The less than (or equal to) operator as used in the parser
        COMPARISON_LTE = "<=".freeze
        # The greater than (or equal to) operator as used in the parser
        COMPARISON_GTE = ">=".freeze
        # The joint set operator as used in the parser
        COMPARISON_JOINT_SET = "}~{".freeze
        # The superset operator as used in the parser
        COMPARISON_SUPERSET = "}>{".freeze
        # The subset operator as used in the parser
        COMPARISON_SUBSET = "}<{".freeze
        # The disjoint set operator as used in the parser
        COMPARISON_DISJOINT_SET = "}!{".freeze 
        # All valid SpahQL operators collected into an array for convenience.
        COMPARISON_OPERATORS = [
          COMPARISON_STRICT_EQUALITY, COMPARISON_ROUGH_EQUALITY, COMPARISON_INEQUALITY,
          COMPARISON_LT, COMPARISON_GT, COMPARISON_LTE, COMPARISON_GTE,
          COMPARISON_JOINT_SET, COMPARISON_SUPERSET, COMPARISON_SUBSET, COMPARISON_DISJOINT_SET
        ].freeze
        
        # Detects comparison operators at the given index in the given string query.
        #
        # @param [Numeric] i The index at which to detect the token
        # @param [String] query The string query
        # @return [Array, nil] An array in the form \[resumeIndex, foundToken\], or nil if no token was found.
        def self.parse_at(i, query)
          [3,2,1].each do |c|
            if(COMPARISON_OPERATORS.include?(query[i,c]))
              return [i+c, self.new(query[i,c])]   
            end#if
          end#each
          return nil
        end
        
      end
      
    end
  end
end