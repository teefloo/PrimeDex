import { describe, it, expect, beforeEach } from 'vitest';
import { usePokedexStore } from '../store/pokedex';

describe('usePokedexStore', () => {
  beforeEach(() => {
    usePokedexStore.getState().resetFilters();
    usePokedexStore.getState().clearTeam();
    usePokedexStore.getState().clearCompare();
  });

  it('should add and remove favorites', () => {
    const { addFavorite, removeFavorite, isFavorite } = usePokedexStore.getState();
    
    addFavorite(1);
    expect(isFavorite(1)).toBe(true);
    
    removeFavorite(1);
    expect(isFavorite(1)).toBe(false);
  });

  it('should add to team up to 6 members', () => {
    const { addToTeam } = usePokedexStore.getState();
    
    for (let i = 1; i <= 7; i++) {
      addToTeam(i);
    }
    
    expect(usePokedexStore.getState().team.length).toBe(6);
  });

  it('should update quiz high scores', () => {
    const { updateQuizHighScore } = usePokedexStore.getState();
    
    updateQuizHighScore('survival', 50);
    expect(usePokedexStore.getState().quizHighScores.survival).toBe(50);
    
    updateQuizHighScore('survival', 30); // Should keep the highest
    expect(usePokedexStore.getState().quizHighScores.survival).toBe(50);
  });

  it('should add badges and check for them', () => {
    const { addBadge, hasBadge } = usePokedexStore.getState();
    
    addBadge('quiz-master');
    expect(hasBadge('quiz-master')).toBe(true);
    expect(hasBadge('non-existent')).toBe(false);
  });
});
