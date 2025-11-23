import React from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import SetupScreen from './screens/SetupScreen';
import AuctionFloor from './screens/AuctionFloor';

const Main = () => {
  const { isSetup } = useAuction();
  return isSetup ? <AuctionFloor /> : <SetupScreen />;
};

function App() {
  return (
    <AuctionProvider>
      <Main />
    </AuctionProvider>
  );
}

export default App;
