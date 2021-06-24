export const SidebarFooter = ({ isMinimized }: { isMinimized: boolean }) => {
  return (
    <div className="flex justify-center items-center h-40 text-10 bg-black bg-opacity-20">
      {!isMinimized ? '© Bancor 2021' : ''}
    </div>
  );
};
