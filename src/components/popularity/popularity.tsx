import { ReactComponent as Star } from 'assets/icons/star.svg';
import { ReactComponent as EmptyStar } from 'assets/icons/emptyStar.svg';

export const Popularity = ({ stars }: { stars: number }) => {
  return (
    <div className="flex items-center gap-x-2">
      {[...Array(5)].map((_, index) =>
        index < stars ? (
          <Star key={index} className="w-16 h-16 text-warning" />
        ) : (
          <EmptyStar key={index} className="w-16 h-16 text-grey" />
        )
      )}
    </div>
  );
};
