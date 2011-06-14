describe Spah::SpahQL::Token::Set do
  
  it "Returns a correct new index and found string when reading ahead for set literals" do
    
    tests = {
      [0, "{1,'2,',true}"] => [13, {:values => [1,"2,",true], :is_range => false}],
      [2, "--{1.5,false,true}--"] => [18, {:values => [1.5,false,true], :is_range => false}],
      [2, "--{'a'..'d'}--"] => [12, {:values => ['a','d'], :is_range => true}]
    }
    
    tests.each_pair do |key, value|
      index, set = Spah::SpahQL::Token::Set.parse_at(*key)
      
      index.should == value[0]
      if(value[1][:values])
        set.tokens.map {|t| t.value }.should == value[1][:values]
      end
    end
    
    # Errors
    lambda { Spah::SpahQL::Token::Set.parse_at(0, "{'a'..'d',2}--") }.should raise_error
    lambda { Spah::SpahQL::Token::Set.parse_at(0, "{'b','a'..'d'}--") }.should raise_error
  end
  
end