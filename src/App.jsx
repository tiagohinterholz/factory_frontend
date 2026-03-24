import { BrowserRouter, Routes, Route } from "react-router-dom"

import DashboardLayout from "@/modules/core/layout/DashboardLayout"
import Dashboard from "@/modules/dashboard/pages/Dashboard"
import Login from "@/modules/auth/pages/Login"
import PrivateRoute from "@/routes/PrivateRoute"

import BusinessList from "@/modules/business/pages/BusinessList"
import BusinessDetail from "@/modules/business/pages/BusinessDetail"
import BusinessCreate from "@/modules/business/pages/BusinessCreate"

import StateList from "@/modules/location/state/pages/StateList"
import StateCreate from "@/modules/location/state/pages/StateCreate"
import StateEdit from "@/modules/location/state/pages/StateEdit"

import CityList from "@/modules/location/city/pages/CityList"
import CityCreate from "@/modules/location/city/pages/CityCreate"
import CityEdit from "@/modules/location/city/pages/CityEdit"

import SupplierList from "@/modules/supplier/pages/SupplierList"
import SupplierEdit from "@/modules/supplier/pages/SupplierDetail"
import SupplierCreate from "@/modules/supplier/pages/SupplierCreate"



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/empreendimentos"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <BusinessList />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/empreendimentos/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <BusinessDetail />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/empreendimentos/novo"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <BusinessCreate />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/estados"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <StateList />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/estados/novo"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <StateCreate />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/estados/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <StateEdit />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cidades"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CityList />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/cidades/novo"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CityCreate />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/cidades/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CityEdit />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/fornecedores"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <SupplierList />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/fornecedores/novo"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <SupplierCreate />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/fornecedores/:id"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <SupplierEdit />
              </DashboardLayout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
