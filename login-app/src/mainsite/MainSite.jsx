import React from 'react';

function MainSite({ token, email }) {
  return (
    <div>
      <h1>Welcome, {email}!</h1>
      <p>Your JWT token: {token}</p>
    </div>
  );
}

export default MainSite; // <-- EZ HIÁNYZOTT
