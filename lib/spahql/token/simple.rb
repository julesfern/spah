require File.join(File.dirname(__FILE__), 'base')
require File.join(File.dirname(__FILE__), 'set')

module Spah
  module SpahQL
    module Token
      
      # An intermediary type extended by all any token with a single value such as a string, number, boolean,
      # or a filter query.
      # All subclasses follow the same rules as Token::Base, plus they must store their basic value in the @value
      # variable.
      class Simple < Base
        
        # Stores the primitive value of this token. The primitive value will always have a type corresponding
        # to the implementing class, for instance Token::String will always return a string, Token::Numeric a number
        # and so on.
        attr_accessor :value
        
        # Instantiate a new simple token with the given value.
        def initialize(value)
          self.value = value
        end
        
        # Basic equality helper for token comparisons
        def ==(other_token)
          (other_token.is_a?(Simple)) and (other_token.value == self.value)
        end
        
        # Converts the standalone token to a set literal
        def to_set
          Spah::SpahQL::Token::Set.new([self])
        end
        
      end
      
    end
  end
end