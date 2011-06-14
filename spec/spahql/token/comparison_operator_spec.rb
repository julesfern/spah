describe Spah::SpahQL::Token::ComparisonOperator do
  
  it "returns the correct index and result when reading ahead for comparison operators" do
    
    tests = {
      [1, "3>4"], [2, ">"],
      [1, "3==4"], [3, "=="],
      [1, "3}!{4"], [4, "}!{"]
    }
    
    tests.each do |key, value|
      index, token = Spah::SpahQL::Token::ComparisonOperator.parse_at(*key)
      index.should == value[0]
      token.value.should == value[1]
    end
    
  end
  
end