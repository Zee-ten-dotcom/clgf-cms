import './whatsapp-layout.css';
import { useState } from 'react';

export default function WhatsAppShare() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');

  const templates: Record<string, string> = {
    announcement:
      'Greetings from The City Of The Living God Fellowship.\n\nWe would like to share an important church announcement.\n\nThe Lord is Our Help.',
    meeting:
      'Greetings from CLGF.\n\nYou are invited to an important church meeting.\n\nPlease confirm your availability.',
    prayer:
      'Greetings from CLGF.\n\nWe invite you to join us in prayer.\n\nThe Lord is Our Help.',
    followup:
      'Greetings from The City Of The Living God Fellowship.\n\nWe are checking in and praying for you. May God bless you.'
  };

  const send = () => {
    const text = message.trim() || templates[type];
    const digits = phone.replace(/\D/g, '');
    const number = digits.startsWith('0')
      ? '27' + digits.slice(1)
      : digits;

    const url = number
      ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="clgf-whatsapp-share">
      <h3>WhatsApp Church Notifications</h3>
      <p>Prepare a message and open WhatsApp to send it.</p>

      <label>Message Type</label>
      <select
        value={type}
        onChange={e => {
          setType(e.target.value);
          setMessage('');
        }}
      >
        <option value="announcement">Church Announcement</option>
        <option value="meeting">Leadership Meeting</option>
        <option value="prayer">Prayer Reminder</option>
        <option value="followup">Visitor Follow-up</option>
      </select>

      <div className="clgf-wa-field"><label>Recipient Phone (optional)</label>
        <input
          type="tel"
          value={phone}
          placeholder="083 123 4567"
          onChange={e => setPhone(e.target.value)}
        /></div>

      <p>
        <label>Message</label>
        <textarea
          rows={5}
          value={message}
          placeholder={templates[type]}
          onChange={e => setMessage(e.target.value)}
        />
      </p>

      <button type="button" onClick={send}>
        Open WhatsApp
      </button>
    </section>
  );
}
