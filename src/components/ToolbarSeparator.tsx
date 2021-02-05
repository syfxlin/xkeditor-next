import styled from "@emotion/styled";

const Separator = styled.div`
  height: 24px;
  width: 2px;
  background: ${props => props.theme.reverse.text[2]};
  opacity: 0.3;
  display: inline-block;
  margin-left: 10px;
`;

export default Separator;
