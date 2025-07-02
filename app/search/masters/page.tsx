import MasterSearchPage from '../../components/masters/MasterSearchPage';

// Отключаем статическую генерацию для этой страницы
export const dynamic = 'force-dynamic';

export default function SearchMastersPage() {
  return <MasterSearchPage />;
} 