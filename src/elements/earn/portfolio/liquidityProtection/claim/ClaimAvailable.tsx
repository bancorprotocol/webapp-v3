import { Image } from '../../../../../components/image/Image';

export const ClaimAvailable = () => {
  return (
    <section className="content-section py-20">
      <h2 className="ml-[20px] md:ml-[44px]">Available to Claim</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />
      <div className="mx-[20px] md:mx-[44px] mt-30 mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              alt="BNT Logo"
              className="w-30 mr-10"
              src="https://assets.coingecko.com/coins/images/736/small/bancor-bnt.png?1628822309"
            />
            <span>No BNT to claim</span>
          </div>
          <button className="btn-primary btn-sm rounded-[12px]" disabled>
            Claim BNT
          </button>
        </div>
      </div>
    </section>
  );
};
