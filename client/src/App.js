import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Video from "./components/Video";
import userEntrance from "./components/userEntrance";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <React.Fragment>
        <Route path="/Auction" exact component={userEntrance} />
        <Route path="/Auction/:roomId" exact component={Video} />
      </React.Fragment>
    </BrowserRouter>
  );
}

export default App;
