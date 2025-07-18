import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LeagueStats from '@/components/league-stats';

interface Props {
  params: Promise<{ leagueId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Estadísticas de la Liga - Beer Team Darts`,
    description: 'Estadísticas detalladas de la liga con análisis de actividad y rendimiento',
  };
}

export default async function LeagueStatsPage({ params }: Props) {
  const { leagueId } = await params;

  if (!leagueId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/admin"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver al Panel Admin
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Estadísticas de la Liga
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <LeagueStats leagueId={leagueId} />
      </main>
    </div>
  );
} 