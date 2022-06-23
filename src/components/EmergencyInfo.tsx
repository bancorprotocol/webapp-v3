export const EmergencyInfo = () => {
  return (
    <div className="flex flex-col items-center justify-between">
      <div>
        Due to extreme market conditions, the Impermanent Loss Protection
        mechanism is temporarily paused on withdrawals from the network.
      </div>
      <div className="font-bold">
        IL protection is expected to be reinstated on withdrawals as the market
        calms down.
      </div>
      <div>This is a temporary measure to protect the protocol.</div>
    </div>
  );
};
