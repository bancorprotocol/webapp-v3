import { Image } from 'components/image/Image';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { LineChartSimple } from 'components/charts/LineChartSimple';
import { LineData } from 'lightweight-charts';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';

export const TokenTable = () => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const sampleTokens = tokens.slice(0, 20);

  const sampleData: LineData[] = [
    { time: '2019-04-11', value: 80.01 },
    { time: '2019-04-12', value: 96.63 },
    { time: '2019-04-13', value: 76.64 },
    { time: '2019-04-14', value: 81.89 },
    { time: '2019-04-15', value: 74.43 },
    { time: '2019-04-16', value: 80.01 },
    { time: '2019-04-17', value: 96.63 },
    { time: '2019-04-18', value: 76.64 },
    { time: '2019-04-19', value: 81.89 },
    { time: '2019-04-20', value: 74.43 },
    { time: '2019-04-21', value: 80.01 },
    { time: '2019-04-22', value: 96.63 },
    { time: '2019-04-23', value: 76.64 },
    { time: '2019-04-24', value: 81.89 },
    { time: '2019-04-25', value: 74.43 },
    { time: '2019-04-26', value: 80.01 },
    { time: '2019-04-27', value: 96.63 },
    { time: '2019-04-28', value: 76.64 },
    { time: '2019-04-29', value: 81.89 },
    { time: '2019-04-30', value: 74.43 },
  ];

  return (
    <section className="content-section pt-20 pb-10">
      <h2 className="ml-20 mb-20">Tokens</h2>
      <table className={'w-full'}>
        <thead>
          <tr>
            <th className={'min-w-[100px]'}>Protected</th>
            <th className={'min-w-[150px]'}>Name</th>
            <th className={'min-w-[100px]'}>24h Change</th>
            <th className={'min-w-[100px]'}>24h Volume</th>
            <th className={'min-w-[70px]'}>Price</th>
            <th className={'min-w-[70px]'}>Liquidity</th>
            <th className={'min-w-[70px]'}>Last 7 Days</th>
            <th className={'min-w-[70px]'}></th>
          </tr>
        </thead>
        <tbody>
          {sampleTokens.map((token) => {
            return (
              <tr key={token.address}>
                <td>
                  <IconProtected className="w-18 h-20 text-primary" />
                </td>
                <td>
                  <div className={'flex items-center'}>
                    <Image
                      src={token.logoURI}
                      alt="Token"
                      className="bg-grey-2 rounded-full h-28 w-28 mr-5"
                    />
                    <h3>{token.symbol}</h3>
                  </div>
                </td>
                <td>+12.63%</td>
                <td>{prettifyNumber(123456, true)}</td>
                <td>{prettifyNumber(token.usdPrice ?? 0, true)}</td>
                <td>{prettifyNumber(123456, true)}</td>
                <td>
                  <LineChartSimple data={sampleData} />
                </td>
                <td>
                  <button className="btn-primary btn-sm rounded-[12px]">
                    Trade
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
