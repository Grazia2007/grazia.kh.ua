import HomeClient from './home-client';
import { getGroupedPortfolio } from './lib/portfolio';

// дані портфоліо читаються на сервері - html приходить у Google уже з контентом
export default async function Page() {
  const initialProjects = await getGroupedPortfolio();
  return <HomeClient initialProjects={initialProjects} />;
}
