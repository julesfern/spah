describe Spah::SpahQL::Token::KeyName do
  
  it "parses and returns the new index correctly" do
    
    tests = {
      [0, "foo_bar"] => [7, "foo_bar"],
      [1, " bubbles97"] => [10, "bubbles97"],
      [0, "foo/"] => [3, "foo"]
    }
    
    tests.each_pair do |key, value|
      result = Spah::SpahQL::Token::KeyName.parse_at(*key)
      result[0].should == value[0]
      result[1].value.should == value[1]
    end
    
  end
  
end