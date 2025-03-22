import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ExamsPage from '../features/exams/ExamsPage';
import SeatingPage from '../features/seating/SeatingPage';
import RoomPage from '../features/room/RoomPage';
import StaffPage from '../features/staff/StaffPage';
import StudentsPage from '../features/student/StudentsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ExamsPage />,
      },
      {
        path: 'exams',
        element: <ExamsPage />,
      },
      {
        path: 'staff',
        element: <StaffPage />,
      },
      {
        path: 'seating-arrangement',
        element: <SeatingPage />,
      },
      {
        path: 'room',
        element: <RoomPage />,
      },
      ,
      {
        path: 'student',
        element: <StudentsPage />,
      },
    ],
  },
]);

export default router;