import React from "react";
import {styled} from "@mui/material";
import {useTranslation} from "react-i18next";

import {Layout} from "@shared/lib/layout";
import {Text} from "@shared/ui/atoms";

import {model} from "../model";

export const ExplodingKittenProbability: React.FC = () => {
  const {t} = useTranslation("match");

  const match = model.useMatch()!;

  const players = match.players.length + match.out.length;

  const min = Math.floor(((players - 1) / match.draw) * 100);
  const max = Math.floor((players / match.draw) * 100);

  return (
    <Wrapper gap={1}>
      <Text font="primary" size={1.2} transform="uppercase">
        {t("ek-chance")}
      </Text>

      <Text font="primary" size={2.8} transform="uppercase">
        {(max + min) / 2}%
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled(Layout.Col)`
  max-width: 20rem;
  border-radius: 10px;
  background: ${({theme}) => theme.palette.background.paper};
  border: 2px solid ${({theme}) => theme.palette.divider};
  text-align: center;
  padding: 2rem;
`;
