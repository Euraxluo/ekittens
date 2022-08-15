import * as React from "react";
import {styled} from "@mui/material";

interface MainTemplateProps {
  children: React.ReactNode;
}

export const MainTemplate: React.FC<MainTemplateProps> = ({children}) => (
  <Wrapper>{children}</Wrapper>
);

const Wrapper = styled("div")`
  width: 100%;
  min-height: 100vh;
  height: 100%;
`;
