export const SidebarFooter = ({ isMinimized }: { isMinimized: boolean }) => {
  return (
    <div
      className={`flex justify-center items-center h-40 text-10 bg-black bg-opacity-30 rounded-br`}
    >
      <span
        className={`transition-all duration-500 ease-in-out ${
          isMinimized ? 'opacity-0' : ''
        }`}
      >
        © Bancor 2021
      </span>
    </div>
  );
};
