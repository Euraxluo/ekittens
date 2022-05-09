import * as React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";

import {App} from "@app/application";
import {store} from "@shared/lib/store";
import "@shared/lib/i18n";

const element = document.getElementById("root") as Element;
const root = createRoot(element);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
