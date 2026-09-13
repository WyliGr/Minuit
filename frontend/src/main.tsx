import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@fontsource-variable/outfit'
import '@fontsource-variable/jetbrains-mono'
import '@/index.css'
import { Layout } from '@/components/Layout'

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
)