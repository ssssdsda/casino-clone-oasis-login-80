
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Initialize the root element only if it exists
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found. App cannot be rendered.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <Router>
        <App />
      </Router>
    );
  } catch (error) {
    console.error("Error rendering the application:", error);
  }
}
