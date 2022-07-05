import {Theme} from "@mui/material";

import {light} from "./light";
import {dark} from "./dark";
import {Theme as T} from "../lib/typings";

export const themes: Record<T, Theme> = {
  light,
  dark,
};
