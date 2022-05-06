import { usePages } from 'pages/Router';

export const NetworkIndicator = () => {
  const { goToPage } = usePages();

  return (
    <button
      onClick={() => goToPage.admin()}
      className="flex items-center h-[35px] px-20 text-12 rounded-full bg-fog border border-graphite text-charcoal dark:text-white text-opacity-50 dark:text-opacity-50 dark:border-grey dark:bg-black"
    >
      <div className={`bg-error w-6 h-6 rounded-full mr-10`} />
      Tenderly Fork
    </button>
  );
};
