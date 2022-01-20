import { ReactComponent as Star } from 'assets/icons/star.svg';

export const Popularity = ({ stars }: { stars: number }) => {
  return (
    <div className="flex items-center gap-x-2">
      {[...Array(stars)].map((_, index) => (
        <Star key={index} className="w-16 h-16 text-warning" />
      ))}
    </div>
  );
};
