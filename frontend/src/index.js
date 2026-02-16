import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console
    console.error('React Error Boundary Caught:', error, errorInfo);
    
    // You can also send error to your analytics service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #031B28 0%, #0B2838 100%)',
          color: '#DBA858',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '2rem',
            background: 'rgba(3, 27, 40, 0.9)',
            borderRadius: '10px',
            border: '2px solid #8C0E0F'
          }}>
            <h2 style={{ color: '#E89C31', marginBottom: '1rem' }}>
              🚨 Something went wrong!
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <div style={{ 
              background: 'rgba(140, 14, 15, 0.2)', 
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              textAlign: 'left',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <strong>Error Details:</strong>
              <pre style={{ 
                margin: '0.5rem 0', 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error && this.state.error.toString()}
              </pre>
              <details style={{ fontSize: '0.7rem' }}>
                <summary>Stack Trace</summary>
                <pre style={{ 
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #E89C31 0%, #DBA858 100%)',
                color: '#031B28',
                border: 'none',
                padding: '0.8rem 2rem',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 5px 15px rgba(232, 156, 49, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🔄 Refresh Page
            </button>
            <div style={{ 
              marginTop: '1rem', 
              fontSize: '0.7rem', 
              color: '#A0AEC0'
            }}>
              <p>
                If the problem persists, contact support with the error details above.
              </p>
              <p>
                <strong>Frontend:</strong> http://localhost:3000 | 
                <strong> Backend:</strong> http://localhost:5000
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with error boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Log startup information
console.log(`
🎓 College Event Platform - Frontend
====================================
Environment: ${process.env.NODE_ENV || 'development'}
Build Date: ${new Date().toLocaleString()}
Version: 1.0.0
Super Admin Features: ✅ Enabled
API URL: ${process.env.REACT_APP_API_URL || 'http://localhost:5000'}
====================================
`);