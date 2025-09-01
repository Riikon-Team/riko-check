import React from 'react';
import QRCode from 'qrcode.react';

function QRCodeComponent({ url, size = 200 }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <QRCode value={url} size={size} />
    </div>
  );
}

export default QRCodeComponent;
