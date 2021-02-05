import styled from "@emotion/styled";

const Input = styled.input`
  font-size: 15px;
  background: ${props => props.theme.reverse.background[0]};
  color: ${props => props.theme.reverse.text[2]};
  border-radius: 2px;
  padding: 3px 8px;
  border: 0;
  margin: 0;
  outline: none;
  flex-grow: 1;
`;

export default Input;
