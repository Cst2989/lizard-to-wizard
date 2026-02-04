import React from 'react'
import ReactDOM from 'react-dom/client'
import RedeemPromo from './features/promo-codes'
import SocialFeed from './features/social-feed'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import RedeemPromoInt from './features/promo-codes-international';
import DashboardComponents from './features/dashboards';

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
  {
    path: "/promo",
    element: <RedeemPromo/>,
  },
  {
    path: "/promo-int",
    element: <RedeemPromoInt/>,
  },
  {
    path: "/social",
    element: <SocialFeed/>,
  },
  {
    path: "/dashboard",
    element: <DashboardComponents/>,
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
