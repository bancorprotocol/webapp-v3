export const MyRewards = () => {
  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light">
      <h2 className="ml-[20px] md:ml-[33px]">Rewards</h2>
      <hr className="content-separator my-14 mx-[20px] md:ml-[34px] md:mr-[44px]" />
      <div className="flex justify-between md:ml-[34px] md:mr-[44px]">
        <div>
          <div className="mb-5">Total Rewards to Date</div>
          <div>
            <span className="md:text-16 font-semibold mr-5">322.33 BNT</span>
            <span className="text-12 text-primary">(~$56.85)</span>
          </div>
        </div>
        <div>
          <div className="mb-5">Claimable Rewards</div>
          <div>
            <span className="md:text-16 font-semibold mr-5">322.33 BNT</span>
            <span className="text-12 text-primary">(~$56.85)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
