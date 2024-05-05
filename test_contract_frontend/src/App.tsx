import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { fromNano } from "@ton/core";
import WebApp from "@twa-dev/sdk"

function App() {
  const {
    contract_address,
    counter_value,
    contract_balance,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest
  } = useMainContract();

  const { connected } = useTonConnect()

  return (
    <div>
      <div>
        <TonConnectButton />
      </div>
      <div>
        <div className='Card'>
          Our platform is : <b>{WebApp.platform}</b>
          <br />
          <b>Our contract Address</b>
          <div className='Hint'>{contract_address}</div>
          <b>Our contract Balance</b>
          {contract_balance && ( 
            <div className='Hint'>{fromNano(contract_balance)}</div>
          )}
        </div>

        <div className='Card'>
          <b>Counter Value</b>
          <div>{counter_value ?? "Loading..."}</div>
        </div>

        <a
          onClick={() => {
            WebApp.showAlert("Hey there!");
          }}
        >
          Show Alert
        </a>

        <br />

        {connected && (
          <a
            onClick={() => {
              sendIncrement();
            }}
          >
            Increment
          </a>
        )}

        <br />
 
        {connected && (
        <a
          onClick={() => {
            sendDeposit();
          }}
        >
          Request deposit of 0.3 TON
        </a>
        )}  

        <br />
 
        {connected && (
        <a
          onClick={() => {
            sendWithdrawalRequest();
          }}
        >
          Request withdrawla of 0.5 TON
        </a>
        )}  

      </div>
    </div>  
  );
}

export default App;