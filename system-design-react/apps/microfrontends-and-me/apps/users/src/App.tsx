import React from 'react';

const App: React.FC = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Active' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Inactive' },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return '#ef4444';
      case 'Manager': return '#f59e0b';
      case 'User': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0 }}>Users Micro Frontend</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Running on port 5004
        </p>
      </div>
      
      <div style={{
        background: '#f7f7f7',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <button
            style={{
              background: '#fa709a',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Add New User
          </button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Role</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px' }}>
                    <strong>{user.name}</strong>
                  </td>
                  <td style={{ padding: '15px', color: '#666' }}>{user.email}</td>
                  <td style={{ padding: '15px' }}>
                    <span
                      style={{
                        background: getRoleBadgeColor(user.role),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ color: user.status === 'Active' ? '#10b981' : '#6b7280' }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button
                      style={{
                        background: 'transparent',
                        border: '1px solid #d1d5db',
                        padding: '5px 15px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '5px',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        background: 'transparent',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '5px 15px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
