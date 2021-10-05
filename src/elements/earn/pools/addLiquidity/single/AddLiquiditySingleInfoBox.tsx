export const AddLiquiditySingleInfoBox = () => {
  return (
    <div className="p-20 rounded bg-blue-0 dark:bg-blue-5 text-primary-dark dark:text-primary-light">
      <h3 className="text-14 font-semibold mb-14">
        Learn what it means to add liquidity to a pool:
      </h3>
      <ol>
        <li>
          <a
            href="https://blog.bancor.network/how-to-stake-liquidity-earn-fees-on-bancor-bff8369274a1"
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            1. How do I make money by providing liquidity?
          </a>
        </li>
        <li>
          <a
            href="https://blog.bancor.network/beginners-guide-to-getting-rekt-by-impermanent-loss-7c9510cb2f22"
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            2. What is impermanent loss?
          </a>
        </li>
        <li>
          <a
            href="https://newsletter.banklesshq.com/p/how-to-protect-yourself-from-impermanent"
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            3. How does Bancor protect me from impermanent loss?
          </a>
        </li>
      </ol>
    </div>
  );
};
