const API_BASE = import.meta.env.VITE_API_BASE_URL || '/shiju/api';

export async function getDailyStats(): Promise<{ reviewedToday: number; goal: number }> {
  const response = await fetch(`${API_BASE}/review/daily-stats`);
  if (!response.ok) throw new Error('Failed to get daily stats');
  return response.json();
}

export async function getReviewCalendar(days: number = 30): Promise<{ calendar: Array<{ date: string; count: string }> }> {
  const response = await fetch(`${API_BASE}/review/calendar?days=${days}`);
  if (!response.ok) throw new Error('Failed to get calendar');
  return response.json();
}

export async function getDailyGoal(): Promise<{ goal: number }> {
  const response = await fetch(`${API_BASE}/settings/daily-goal`);
  if (!response.ok) throw new Error('Failed to get daily goal');
  return response.json();
}

export async function setDailyGoal(goal: number): Promise<{ success: boolean; goal: number }> {
  const response = await fetch(`${API_BASE}/settings/daily-goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal }),
  });
  if (!response.ok) throw new Error('Failed to set daily goal');
  return response.json();
}
