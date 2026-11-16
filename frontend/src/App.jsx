import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import RequireLogin from './routes/RequireLogin'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import ItemDetailsPage from './pages/ItemDetailsPage'
import ReportPage from './pages/ReportPage'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ClaimPage from './pages/ClaimPage'
import DashboardHomePage from './pages/dashboard/DashboardHomePage'
import MyLostReportsPage from './pages/dashboard/MyLostReportsPage'
import MyFoundReportsPage from './pages/dashboard/MyFoundReportsPage'
import MyClaimsPage from './pages/dashboard/MyClaimsPage'
import EditReportPage from './pages/dashboard/EditReportPage'
import StyleGuidePage from './pages/StyleGuidePage'
import PlaceholderPage from './pages/PlaceholderPage'
import NotFoundPage from './pages/NotFoundPage'

/*
  Every page in Findr and the address (route) it lives at.

  Pages inside <RequireLogin> need an account. Guests get sent to /login
  and come back after logging in.
  The placeholders say which roadmap stage builds them.
*/
const PLANNED_PAGES = [
  { path: '/dashboard/verification', title: 'Claim verification', stage: '3.4', description: 'Review claims on items you found and approve the real owner.' },
  { path: '/dashboard/notifications', title: 'Notifications', stage: '3.5', description: 'Claim decisions and handover updates.' },
  { path: '/profile', title: 'Your profile', stage: '3.6', description: 'Your name, community and contact details.' },
  { path: '/help', title: 'Help and contact', stage: '3.6', description: 'FAQs, safety tips and a way to reach the team.' },
  { path: '/admin', title: 'Admin dashboard', stage: '3.6', description: 'Moderate reports, users, claims and communities.' },
]

function App() {
  return (
    <Routes>
      {/* MainLayout wraps every page with the navbar and footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/items/:id" element={<ItemDetailsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<RequireLogin />}>
          <Route path="/report" element={<ReportPage />} />
          <Route path="/items/:id/claim" element={<ClaimPage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="lost-reports" element={<MyLostReportsPage />} />
            <Route path="found-reports" element={<MyFoundReportsPage />} />
            <Route path="claims" element={<MyClaimsPage />} />
            <Route path="reports/:id/edit" element={<EditReportPage />} />
          </Route>
        </Route>

        {PLANNED_PAGES.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<PlaceholderPage title={page.title} description={page.description} stage={page.stage} />}
          />
        ))}

        {/* A page showing every shared component, for the team to check the design system */}
        <Route path="/style-guide" element={<StyleGuidePage />} />

        {/* Anything else: 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
