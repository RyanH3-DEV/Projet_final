import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';

function App() {
  return (
    <div className="app-layout">
      {/* Je place le Header en haut pour qu'il soit visible partout */}
      <Header />

      {/* Ma page principale change ici selon la navigation */}
      <Home />

      {/* Le Footer reste en bas de toutes les pages */}
      <Footer />
    </div>
  );
}

export default App;