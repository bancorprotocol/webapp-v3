import { Image } from 'components/image/Image';

export const TokensOverlap = ({
  tokens,
}: {
  tokens: { id: string; logo: string }[];
}) => {
  return (
    <div className="flex">
      {tokens.map((token, index) => (
        <Image
          key={token.id}
          src={token.logo}
          alt="Token"
          className={`${
            index === 1 && '-ml-2'
          } shadow bg-white border rounded-full w-30 h-30`}
        />
      ))}
    </div>
  );
};
