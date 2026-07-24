import { ThemeProvider } from './theme-provider';
import { DashboardContent } from './dashboard-content';

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}