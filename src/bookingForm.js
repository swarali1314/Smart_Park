import React, { useState, useEffect } from 'react';

const BookingForm = ({ slot, onCancel, onConfirm }) => {
  const [details, setDetails] = useState({ 
    driverName: '', 
    phone: '', 
    carNumber: '',
    vehicleType: '4-Wheeler', 
    duration: 30 
  });

  const [finalPrice, setFinalPrice] = useState(20);

  // FIXED PRICING LOGIC
  useEffect(() => {
    // Base rates for 30 mins
    const baseRate = details.vehicleType === '2-Wheeler' ? 10 : 20;
    
    // Calculate based on duration (duration / 30 mins)
    // e.g., 60 mins for 4-wheeler = 20 * (60/30) = 40
    const calculated = baseRate * (details.duration / 30);
    setFinalPrice(calculated);
  }, [details.vehicleType, details.duration]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(details, finalPrice);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Booking Details</h3>
        <p style={{ fontSize: '12px', color: '#7f8c8d' }}>{slot.name} | Spot: {slot.spotNum}</p>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Driver Name</label>
            <input required style={inputStyle} onChange={(e) => setDetails({...details, driverName: e.target.value})} />
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            <div style={{flex: 1, textAlign: 'left'}}>
              <label style={labelStyle}>Vehicle</label>
              <select style={inputStyle} value={details.vehicleType} onChange={(e) => setDetails({...details, vehicleType: e.target.value})}>
                <option value="4-Wheeler">4-Wheeler</option>
                <option value="2-Wheeler">2-Wheeler</option>
              </select>
            </div>
            <div style={{flex: 1, textAlign: 'left'}}>
              <label style={labelStyle}>Time</label>
              <select style={inputStyle} value={details.duration} onChange={(e) => setDetails({...details, duration: parseInt(e.target.value)})}>
                <option value={30}>30 Mins</option>
                <option value={60}>1 Hour</option>
                <option value={120}>2 Hours</option>
              </select>
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Vehicle Number</label>
            <input required style={inputStyle} placeholder="MH 12..." onChange={(e) => setDetails({...details, carNumber: e.target.value})} />
          </div>

          <div style={priceSummary}>
            <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'18px', color:'#27ae60'}}>
              <span>Total:</span>
              <span>₹{finalPrice}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onCancel} style={cancelBtn}>Back</button>
            <button type="submit" style={confirmBtn}>Pay Now</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const modalStyle = { background: 'white', padding: '25px', borderRadius: '15px', width: '320px', textAlign: 'center' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputGroup = { display: 'flex', flexDirection: 'column', textAlign: 'left' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#7f8c8d' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%' };
const priceSummary = { background: '#f9f9f9', padding: '10px', borderRadius: '8px' };
const confirmBtn = { flex: 2, padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' };
const cancelBtn = { flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '5px' };

export default BookingForm;