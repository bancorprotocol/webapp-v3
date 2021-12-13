import { NotFoundMobileSvg } from 'assets/notFoundMobileSvg';
import { NotFoundSvg } from 'assets/notFoundSvg';
import { isMobile } from 'react-device-detect';

export const NotFound = () => {
  return (
    <div className="mx-10 mt- md:mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="text-4xl">Page Not Found!</div>
        <div className="text-20 mt-10">
          The page you're looking for is not available.
        </div>
      </div>
      {isMobile ? (
        <div className="mx-auto mt-50 w-[375px] h-[400px]">
          <NotFoundMobileSvg />
        </div>
      ) : (
        <div className="mx-auto w-[1000px] h-[700px]">
          <NotFoundSvg />
        </div>
      )}
    </div>
  );
};
