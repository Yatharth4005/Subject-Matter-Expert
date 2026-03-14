import { auth } from '@/auth';
import { signOut } from '@/auth';
import AgentCard from '@/components/AgentCard';
import StatsCard from '@/components/StatsCard';
import UsageChart from '@/components/UsageChart';
import { AGENTS } from '@/lib/constants';

// Mock stats data — will be replaced with real API call
const mockStats = {
  totalSessions: 142,
  totalMessages: 1847,
  avgDuration: 18,
  favoriteAgent: 'Mathematics',
  weeklyChange: { sessions: 12, messages: 8, duration: -3 },
  dailySessions: [
    4, 6, 3, 8, 5, 7, 9, 6, 11, 8, 7, 12, 10, 6, 9, 14, 11, 8, 13, 10,
    15, 12, 9, 16, 13, 11, 18, 14, 12, 20,
  ],
  sparklines: {
    sessions: [4, 6, 8, 5, 9, 11, 14],
    messages: [22, 35, 28, 41, 38, 45, 52],
    duration: [15, 18, 12, 20, 16, 22, 18],
  },
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header__brand">
          <h1 className="header__logo">SME Agent</h1>
          <span className="header__tagline">Subject Matter Expert Platform</span>
        </div>
        <div className="header__user">
          {session?.user?.image && (
            <img
              className="header__avatar"
              src={session.user.image}
              alt={session.user.name || 'User'}
            />
          )}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {session?.user?.name}
          </span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button type="submit" className="header__signout" id="signout-btn">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Sessions"
          value={mockStats.totalSessions}
          change={mockStats.weeklyChange.sessions}
          sparklineData={mockStats.sparklines.sessions}
          icon="📊"
          accentColor="#8b5cf6"
        />
        <StatsCard
          title="Total Messages"
          value={mockStats.totalMessages}
          change={mockStats.weeklyChange.messages}
          sparklineData={mockStats.sparklines.messages}
          icon="💬"
          accentColor="#3b82f6"
        />
        <StatsCard
          title="Avg Duration"
          value={mockStats.avgDuration}
          change={mockStats.weeklyChange.duration}
          sparklineData={mockStats.sparklines.duration}
          icon="⏱️"
          accentColor="#10b981"
        />
        <StatsCard
          title="Favorite Agent"
          value={0}
          change={0}
          sparklineData={[]}
          icon="⭐"
          accentColor="#f59e0b"
        />
      </div>

      {/* Usage Chart */}
      <UsageChart data={mockStats.dailySessions} />

      {/* Agent Grid */}
      <h2 className="section-title">Choose Your Expert</h2>
      <div className="agent-grid" id="agent-grid">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.slug} agent={agent} />
        ))}
      </div>
    </div>
  );
}
