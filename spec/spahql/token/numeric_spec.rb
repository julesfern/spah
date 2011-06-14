describe Spah::SpahQL::Token::Numeric do
  
  it "Returns a correct new index and found string when reading ahead for numeric literals" do
    
    tests = {
      # Format [index, query] => [resumeindex, token_value]
    
      # Ints
      [0, '7, bar'] => [1,7],
      [0, '7'] => [1,7],
      [6, 'foo,  -7, foo'] => [8,-7],
      
      # Floats
      [0, '3.21, bar'] => [4,3.21],
      [0, '1.5'] => [3,1.5],
      [6, 'foo,  -7.5, foo'] => [10,-7.5]
    }
    
    tests.each_pair do |key, value|
      res = Spah::SpahQL::Token::Numeric.parse_at(*key)
      res[0].should == value[0]
      res[1].value.should == value[1]
    end
    
    # Not found
    Spah::SpahQL::Token::Numeric.parse_at(0, 'true').should be_nil    
  end
  
end