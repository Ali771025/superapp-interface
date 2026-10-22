export const qoraAdapter = {
  async getQBalance(_address: string): Promise<number> {
    return 1200;
  },

  async getMissions(_address: string): Promise<{ id: string; label: string; progress: number; reward: number }[]> {
    return [
      { id: 'm_001', label: 'Make 5 ecosystem transactions', progress: 3, reward: 50 },
      { id: 'm_002', label: 'Complete Web3 Safety course', progress: 85, reward: 100 },
      { id: 'm_003', label: 'Invite 1 active referral', progress: 100, reward: 75 },
    ];
  },

  async getAchievements(_address: string): Promise<{ id: string; label: string; eqPoints: number }[]> {
    return [
      { id: 'ach_001', label: 'First Purchase', eqPoints: 200 },
      { id: 'ach_002', label: 'Forecast Entered', eqPoints: 50 },
      { id: 'ach_003', label: 'Community Builder', eqPoints: 300 },
    ];
  },
};
