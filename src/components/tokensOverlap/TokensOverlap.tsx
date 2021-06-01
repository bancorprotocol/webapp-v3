export const TokensOverlap = ({
  tokens,
}: {
  tokens: { id: string; logo: string }[];
}) => {
  return (
    <div className="flex">
      {tokens.map((token, index) => (
        <img
          key={token.id}
          src={token.logo}
          alt="Token"
          width="30px"
          height="30px"
          className={`${
            index === 1 && '-ml-2'
          } shadow bg-white border rounded-full`}
        />
      ))}
    </div>
  );
};
