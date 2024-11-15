import React, { useEffect, useState } from 'react';
import { getGifts, addGift } from '../services/api';

const Gifts = () => {
  const [gifts, setGifts] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [giftName, setGiftName] = useState('');
  const [status, setStatus] = useState('Planned');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch gifts on component mount
    const fetchGifts = async () => {
      try {
        const data = await getGifts();
        setGifts(data);
      } catch (err) {
        console.error('Failed to fetch gifts:', err);
      }
    };
    fetchGifts();
  }, []);

  const handleAddGift = async (event) => {
    event.preventDefault();
    try {
      const newGift = await addGift({ recipient_name: recipient, gift_name: giftName, status, link });
      setGifts([...gifts, newGift]);
      setRecipient('');
      setGiftName('');
      setStatus('Planned');
      setLink('');
    } catch (err) {
      console.error('Failed to add gift:', err);
      setError('Could not add gift. Please try again.');
    }
  };

  return (
    <div>
      <h2>Your Gifts</h2>
      {gifts.length === 0 ? (
        <p>No gifts yet. Start adding some!</p>
      ) : (
        <ul>
          {gifts.map((gift) => (
            <li key={gift.id}>
              <strong>{gift.gift_name}</strong> for {gift.recipient_name} - Status: {gift.status}
              {gift.link && (
                <div>
                  <a href={gift.link} target="_blank" rel="noopener noreferrer">
                    View Gift
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3>Add a New Gift</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleAddGift}>
        <div>
          <label>Recipient Name:</label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
        </div>
        <div>
          <label>Gift Name:</label>
          <input type="text" value={giftName} onChange={(e) => setGiftName(e.target.value)} required />
        </div>
        <div>
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Planned">Planned</option>
            <option value="Purchased">Purchased</option>
            <option value="Wrapped">Wrapped</option>
            <option value="Gifted">Gifted</option>
          </select>
        </div>
        <div>
          <label>Link:</label>
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} />
        </div>
        <button type="submit">Add Gift</button>
      </form>
    </div>
  );
};

export default Gifts;
