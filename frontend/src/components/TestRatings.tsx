import { useEffect, useState } from 'react';

function TestRatings() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/books/185/ratings')
      .then((res) => res.json())
      .then((responseData: unknown) => {
        console.log('Direct fetch successful:', responseData);
        setData(responseData);
      })
      .catch((err: Error) => {
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
