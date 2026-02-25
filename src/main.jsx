import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler for debugging production
window.onerror = function (message, source, lineno, colno, error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerText = `Global Error: ${message} at ${source}:${lineno}:${colno}`;
  document.body.appendChild(errorDiv);
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#e2e8f0', backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#f87171' }}>Uygulama Hatası</h1>
          <p style={{ marginBottom: '20px' }}>Beklenmedik bir hata oluştu. Lütfen aşağıdaki hatayı geliştiriciye bildirin:</p>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', overflow: 'auto', border: '1px solid #334155' }}>
            <p style={{ color: '#ef4444', fontWeight: 'bold', fontFamily: 'monospace' }}>{this.state.error && this.state.error.toString()}</p>
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', color: '#94a3b8' }}>Hata Yığınını Göster (Stack Trace)</summary>
              <pre style={{ marginTop: '10px', fontSize: '12px', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '30px', padding: '12px 24px', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0891b2'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#06b6d4'}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
