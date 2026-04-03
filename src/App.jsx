import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Navbar from './pages/navbar';
import Dashboard from './pages/dashboard';

function App() {

  return (
    <>
      <Navbar />
      <Dashboard />
    </>
  )
}

export default App
