import React from 'react';
import QRCode from 'qrcode.react';

function QRCodeComponent({ url, size = 200 }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCode value={url} size={size} />
      </div>
      <p className="text-sm text-gray-600 text-center max-w-xs break-all">
        {url}
      </p>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Sao chép link
      </button>
    </div>
  );
}

export default QRCodeComponent;
