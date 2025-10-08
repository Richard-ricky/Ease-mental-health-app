import { MoodTracker } from "../src/components/MoodTracker";
import { AiChat } from "../src/components/AiChat";
import { VoiceJournal } from "../src/components/VoiceJournal";
import { MoodAnalytics } from "../src/components/MoodAnalytics";
import { HabitTracker } from "../src/components/HabitTracker";
import { TherapistDirectory } from "../src/components/TherapistDirectory";
import { ProgressReports } from "../src/components/ProgressReports";
import { HealthDashboard } from "../src/components/HealthDashboard";
import { GroupTherapy } from "../src/components/GroupTherapy";
import { WellnessPlans } from "../src/components/WellnessPlans";
import { NotificationSettings } from "../src/components/NotificationSettings";
import { DailyMotivation } from "../src/components/DailyMotivation";
import { TodoList } from "../src/components/TodoList";
import { MotivationalVideos } from "../src/components/MotivationalVideos";
import { CommunityChat } from "../src/components/CommunityChat";
import { WellnessTools } from "../src/components/WellnessTools";
import { MentalHealthAssessments } from "../src/components/MentalHealthAssessments";
import { SupportGroups } from "../src/components/SupportGroups";
import { ChatInterface } from "../src/components/ChatInterface";
import { CommunityStories } from "../src/components/CommunityStories";
import { PrivacyDashboard } from "../src/components/PrivacyDashboard";
import { EmergencySupport } from "../src/components/EmergencySupport";
import { UserDirectory } from "../src/components/UserDirectory";
import AchievementSystem from "../src/components/AchievementSystem";
import { WeatherMoodTracker } from "../src/components/WeatherMoodTracker";
import { WellnessChallenge } from "../src/components/WellnessChallenge";
import { CrisisDetectionAI } from "../src/components/CrisisDetectionAI";
import { InteractiveInsights } from "../src/components/InteractiveInsights";
import { HomePage } from "../src/components/HomePage";
import { User, SyncStatus } from "./appHelpers";

export const SECTIONS_REQUIRING_AUTH = [
  "journal", "ai-chat", "voice-journal", "analytics", "habits", 
  "therapists", "reports", "health-dashboard", "group-therapy", 
  "wellness-plans", "notifications", "todos", "community-chat", 
  "wellness", "assessments", "groups", "chat", "privacy", 
  "achievements", "weather-mood", "challenges", "crisis-detection", 
  "interactive-insights", "users"
];

interface SectionRendererProps {
  activeSection: string;
  user: User | null;
  syncStatus: SyncStatus;
  handleSectionChange: (section: string) => void;
  setActiveSection: (section: string) => void;
}

export function renderActiveSection({
  activeSection,
  user,
  syncStatus,
  handleSectionChange,
  setActiveSection
}: SectionRendererProps) {
  if (SECTIONS_REQUIRING_AUTH.includes(activeSection) && !user) {
    setActiveSection("auth");
    return null;
  }

  switch (activeSection) {
    case "journal": return <MoodTracker />;
    case "ai-chat": return <AiChat onSectionChange={handleSectionChange} user={user} />;
    case "voice-journal": return <VoiceJournal />;
    case "analytics": return <MoodAnalytics />;
    case "habits": return <HabitTracker />;
    case "therapists": return <TherapistDirectory />;
    case "reports": return <ProgressReports />;
    case "health-dashboard": return <HealthDashboard />;
    case "group-therapy": return <GroupTherapy />;
    case "wellness-plans": return <WellnessPlans />;
    case "notifications": return <NotificationSettings />;
    case "motivation": return <DailyMotivation />;
    case "todos": return <TodoList onSectionChange={handleSectionChange} />;
    case "videos": return <MotivationalVideos />;
    case "community-chat": return <CommunityChat user={user} />;
    case "wellness": return <WellnessTools />;
    case "assessments": return <MentalHealthAssessments />;
    case "groups": return <SupportGroups />;
    case "chat": return <ChatInterface />;
    case "community": return <CommunityStories user={user} />;
    case "privacy": return <PrivacyDashboard />;
    case "support": return <EmergencySupport />;
    case "users": return <UserDirectory user={user} />;
    case "achievements": return <AchievementSystem />;
    case "weather-mood": return <WeatherMoodTracker />;
    case "challenges": return <WellnessChallenge />;
    case "crisis-detection": return <CrisisDetectionAI />;
    case "interactive-insights": return <InteractiveInsights />;
    default:
      return (
        <HomePage 
          user={user}
          syncStatus={syncStatus}
          handleSectionChange={handleSectionChange}
        />
      );
  }
}