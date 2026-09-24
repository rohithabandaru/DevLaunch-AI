'use client';

export function ConnectClient() {
  return (
    <p style={{ fontSize: 12, color: '#a5b4fc' }}>
      Waiting for the extension to read the connection code… If nothing happens within 15 seconds,
      close this tab and try again from the extension.
    </p>
  );
}