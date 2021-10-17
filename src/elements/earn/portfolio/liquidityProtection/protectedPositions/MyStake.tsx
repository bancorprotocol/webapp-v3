export const MyStake = () => {
  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light">
      <h2 className="ml-[20px] md:ml-[33px]">My Stake</h2>
      <hr className="content-separator my-14 mx-[20px] md:ml-[34px] md:mr-[44px]" />
      <div className="flex justify-between md:ml-[34px] md:mr-[44px]">
        <div>
          <div className="mb-5">Protected Value</div>
          <div className="text-16 text-primary font-semibold">~$56,453</div>
        </div>
        <div>
          <div className="mb-5">Claimable Value</div>
          <div className="text-16 text-primary font-semibold">~$56,453</div>
        </div>
        <div>
          <div className="mb-5">Total Fees</div>
          <div className="text-16 text-primary font-semibold">~$56,453</div>
        </div>
      </div>
    </section>
  );
};
