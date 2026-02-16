import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h2>Welcome to Event Management System</h2>
      <p>Manage your events efficiently</p>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Quick Actions:</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <Link to="/login">
            <button style={{ padding: '10px 20px' }}>Login</button>
          </Link>
          <Link to="/register">
            <button style={{ padding: '10px 20px' }}>Register</button>
          </Link>
          <Link to="/events">
            <button style={{ padding: '10px 20px' }}>View Events</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;