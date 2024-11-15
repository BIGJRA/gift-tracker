import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Gift Tracker</h1>
      <p>Keep track of your gift ideas and manage your shopping with ease.</p>
      <nav>
        <Link to="/login">Login</Link>
        <br />
        <Link to="/gifts">View Gifts</Link>
      </nav>
    </div>
  );
};

export default Home;