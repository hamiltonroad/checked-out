import { useEffect, useState } from 'react';

function TestRatings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/books/185/ratings')
      .then(res => res.json())
      .then(data => {
        console.log('Direct fetch successful:', data);
        setData(data);
      })
      .catch(err => {
        console.error('Direct fetch error:', err);
        setError(err.message);
      });
  }, []);

  return (
    <div>
      <h3>Test Ratings Direct Fetch</h3>
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default TestRatings;