import { HashRouter as Router, Route } from "react-router-dom";
import IndexPage from "../pages/IndexPage";
const RouterView = () => {
  return (
    <Router>
        <Route path="/:userId" component={IndexPage}></Route>
    </Router>
  );
};
export default RouterView;
