import { describe, it, expect, beforeEach } from 'vitest';
import { usePrimeDexStore } from './primedex';

describe('usePrimeDexStore', () => {
  beforeEach(() => {
    usePrimeDexStore.getState().resetFilters();
    usePrimeDexStore.getState().clearTeam();
    usePrimeDexStore.getState().clearCompare();
  });

  it('should add and remove favorites', () => {
    const { addFavorite, removeFavorite, isFavorite } = usePrimeDexStore.getState();
    
    addFavorite(1);
    expect(isFavorite(1)).toBe(true);
    
    removeFavorite(1);
    expect(isFavorite(1)).toBe(false);
  });

  it('should add to team up to 6 members', () => {
    const { addToTeam } = usePrimeDexStore.getState();
    
    for (let i = 1; i <= 7; i++) {
      addToTeam(i);
    }
    
    expect(usePrimeDexStore.getState().team.length).toBe(6);
  });

  it('should update quiz high scores', () => {
    const { updateQuizHighScore } = usePrimeDexStore.getState();
    
    updateQuizHighScore('classic', 50);
    expect(usePrimeDexStore.getState().quizHighScores.classic).toBe(50);
    
    updateQuizHighScore('classic', 30); // Should keep the highest
    expect(usePrimeDexStore.getState().quizHighScores.classic).toBe(50);
  });

  it('should add badges and check for them', () => {
    const { addBadge, hasBadge } = usePrimeDexStore.getState();
    
    addBadge('quiz-master');
    expect(hasBadge('quiz-master')).toBe(true);
    expect(hasBadge('non-existent')).toBe(false);
  });
});
