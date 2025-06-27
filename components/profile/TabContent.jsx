import PersonalDetailsForm from "./settings/PersonalDetailsForm";
import BookingTabs from "./bookings/BookingTabs";
import PasswordSettings from "./settings/PasswordSettings";
import NotificationsSection from "./notifications/NotificationsSection";
import ServicesSection from "./services/ServicesSection";

export default function TabContent({
  activeTab,
  bookings,
  services,
  notifications,
  user,
}) {
  switch (activeTab) {
    case "details":
      return <PersonalDetailsForm user={user} />;
    case "history":
      return <BookingTabs bookings={bookings} />;
    case "password":
      return <PasswordSettings />;
    case "notifications":
      return <NotificationsSection userId={user._id} />;
    case "services":
      return <ServicesSection user={user} services={services} />;
    default:
      return <PersonalDetailsForm user={user} />;
  }
}
