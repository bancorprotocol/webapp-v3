import { NotFoundSvg } from 'assets/notFoundSvg';

export const NotFound = () => {
  return (
    <div className="mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="text-4xl">Page Not Found!</div>
        <div className="text-20 mt-10">
          The page you're looking for is not available.
        </div>
      </div>
      <div className="absolute left-[-410px] md:relative md:mx-auto md:left-0 w-[1000px] h-[700px]">
        <NotFoundSvg />
      </div>
    </div>
  );
};
