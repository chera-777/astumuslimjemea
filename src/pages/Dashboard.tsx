import StudentPortal from "./StudentPortal";

// The Dashboard IS the Student Portal — one canonical view showing the main
// list of student applications. No role-based redirect ping-pong.
const Dashboard = () => <StudentPortal />;

export default Dashboard;
