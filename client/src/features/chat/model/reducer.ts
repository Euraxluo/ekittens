import {createReducer, PayloadAction} from "@reduxjs/toolkit";

import {ChatMessage} from "@shared/api/common";
import * as actions from "./actions";

export interface ChatState {
  messages: ChatMessage[];
}

export const reducer = createReducer<ChatState>(
  {
    messages: [],
  },
  {
    [actions.addMessage.type]: (
      state,
      {payload}: PayloadAction<actions.AddMessagePayload>,
    ) => {
      state.messages.push(payload);
    },
  },
);
