import "./App.css";
import { MaterialList } from "./components/material-list";
import { MaterialSearchProvider } from "./providers/material-search-provider";

function App() {
  return (
    <MaterialSearchProvider>
      <MaterialList />
    </MaterialSearchProvider>
  );
}

export default App;
