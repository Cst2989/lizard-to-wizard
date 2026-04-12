import { useState, useEffect, useCallback } from 'react';
import { Match, League } from '../core/types';
import { fetchLeagues, fetchLeagueMatches, fetchFavorites, addFavorite, removeFavorite } from '../api/client';
import { LeagueSidebar } from '../features/leagues/LeagueSidebar';
import { LeagueHeader } from '../features/leagues/LeagueHeader';
import { MatchList } from '../features/matches/MatchList';
import { MatchDetail } from '../features/matches/MatchDetail';
import { FavoritesFilter } from '../features/favorites/FavoritesFilter';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load leagues on mount
  useEffect(() => {
    fetchLeagues().then(setLeagues).catch(console.error);
    fetchFavorites()
      .then((ids) => setFavorites(new Set(ids)))
      .catch(console.error);
  }, []);

  // Load matches when league changes
  useEffect(() => {
    async function loadMatches() {
      try {
        if (selectedLeagueId) {
          const data = await fetchLeagueMatches(selectedLeagueId);
          setMatches(data);
        } else {
          // Load all matches across all leagues
          const allLeagues = await fetchLeagues();
          const allMatches = await Promise.all(
            allLeagues.map((l) => fetchLeagueMatches(l.id))
          );
          setMatches(allMatches.flat());
        }
      } catch (err) {
        console.error('Failed to load matches:', err);
      }
    }
    loadMatches();
  }, [selectedLeagueId]);

  const handleToggleFavorite = useCallback(
    async (matchId: string) => {
      try {
        if (favorites.has(matchId)) {
          await removeFavorite(matchId);
          setFavorites((prev) => {
            const next = new Set(prev);
            next.delete(matchId);
            return next;
          });
        } else {
          await addFavorite(matchId);
          setFavorites((prev) => new Set(prev).add(matchId));
        }
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
      }
    },
    [favorites]
  );

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId) || null;

  return (
    <div className={styles.dashboard}>
      <LeagueSidebar
        selectedLeagueId={selectedLeagueId}
        onSelectLeague={(id) => {
          setSelectedLeagueId(id);
          setSelectedMatchId(null);
        }}
      />
      <div className={styles.mainContent}>
        <LeagueHeader league={selectedLeague} />
        <FavoritesFilter
          active={showFavoritesOnly}
          onToggle={() => setShowFavoritesOnly((prev) => !prev)}
        />
        <div className={styles.matchArea}>
          <MatchList
            matches={matches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={setSelectedMatchId}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showFavoritesOnly={showFavoritesOnly}
          />
          <MatchDetail matchId={selectedMatchId} />
        </div>
      </div>
    </div>
  );
}
