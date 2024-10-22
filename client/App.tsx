import Providers from './src/contexts/Providers';
import RootNavigation from './src/navigations/RootNavigation';

export default function App() {

  return (
    <Providers>
      <RootNavigation />
    </Providers>
  );
};
