import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
const DashboardComponents = () => {
  const [selectedDashboard, setSelectedDashboard] = useState('dashboard1');
  const { location } = window;

  const handleChange = (event) => {
    const { value } = event.target;
    setSelectedDashboard(value);
    window.location.href = `?selectedDashboard=${value}`;
  }

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const selectedDashboard = query.get('selectedDashboard');
    if (selectedDashboard) {
      // Naively setting the promo code from URL parameter without validation
      setSelectedDashboard(selectedDashboard);
    } 
  }, [location]);

  return (
    <div className='app-container'>
      <h1>Select Dashboard</h1>
      <select onChange={handleChange} value={selectedDashboard}>
        <option value="dashboard1">Dashboard 1</option>
        <option value="dashboard2">Dashboard 2</option>
        <option value="dashboard3">Dashboard 3</option>
      </select>
      {selectedDashboard ? <p>Selected Dashboard: <strong dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(selectedDashboard, {
        ALLOWED_TAGS: ['strong', 'b'],
      })}}></strong></p> : <p>No Dashboard is selected</p>} 
    </div>
  );
};

export default DashboardComponents;
