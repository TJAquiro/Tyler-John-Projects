import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PurchaseSuccess = () => {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = ['Purchase successful.', 'Your order is on the way.', 'Your order is on the way. .', 'Your order is on the way. . .', 'Redirecting to Dashboard. . .'];

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(prev => {
        if (prev < messages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => navigate('/dashboard'), 1000);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.5rem' }}>
      <p>{messages[messageIndex]}</p>
    </div>
  );
};

export default PurchaseSuccess;
