import { GoToPage } from 'router/goToPage.service';
import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const goToPage = new GoToPage(useNavigate());

  return { goToPage };
};
