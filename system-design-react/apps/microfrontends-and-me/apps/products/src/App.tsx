import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0 }}>Products Micro Frontend</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Running on port 5001
        </p>
      </div>
      
      <div style={{
        background: '#f7f7f7',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <h2>Product Catalog</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {[1, 2, 3, 4].map((id) => (
            <div
              key={id}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ marginTop: 0 }}>Product {id}</h3>
              <p style={{ color: '#666' }}>Description for product {id}</p>
              <p style={{ fontWeight: 'bold', color: '#667eea' }}>Price: {id * 29.99}</p>
              <button
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
