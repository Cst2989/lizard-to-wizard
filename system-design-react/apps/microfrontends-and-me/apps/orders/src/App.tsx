import React from 'react';

const App: React.FC = () => {
  const orders = [
    { id: 1001, customer: 'John Doe', status: 'Delivered', total: 129.99, date: '2024-01-15' },
    { id: 1002, customer: 'Jane Smith', status: 'Processing', total: 89.50, date: '2024-01-16' },
    { id: 1003, customer: 'Bob Johnson', status: 'Shipped', total: 249.99, date: '2024-01-17' },
    { id: 1004, customer: 'Alice Brown', status: 'Pending', total: 179.99, date: '2024-01-18' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#10b981';
      case 'Shipped': return '#3b82f6';
      case 'Processing': return '#f59e0b';
      case 'Pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0 }}>Orders Micro Frontend</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Running on port 5002
        </p>
      </div>
      
      <div style={{
        background: '#f7f7f7',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <h2>Recent Orders</h2>
        <div style={{ marginTop: '20px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '5px' }}>Order #{order.id}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>{order.customer}</p>
                <p style={{ margin: '5px 0', color: '#999', fontSize: '14px' }}>{order.date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    background: getStatusColor(order.status),
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    marginBottom: '10px',
                    display: 'inline-block',
                  }}
                >
                  {order.status}
                </div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>
                  ${order.total}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
