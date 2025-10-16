import Hero from './components/custom/Hero'
import { useSEO } from './context/SEOContext'

function App() {
  const { pageSEO } = useSEO();

  // Apply SEO for homepage
  return (
    <div>
      {pageSEO.home()}
      {/* Hero */}
      <Hero/>
    </div>
  )
}

export default App
