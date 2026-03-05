import React from 'react';

const ParkingGrid = ({ location, onSelectSpot, onCancel }) => {
  // Simulating 12 spots for this location
  // In a real app, you would fetch these statuses from Firestore
  const spots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const occupiedSpots = [2, 5, 9]; // Example: these are already taken

  return (
    <div style={overlayStyle}>
      <div style={gridCard}>
        <h3>Select a Spot at {location.name}</h3>
        <p>Green = Available | Red = Occupied</p>
        
        <div style={gridContainer}>
          {spots.map(num => {
            const isTaken = occupiedSpots.includes(num);
            return (
              <div 
                key={num}
                onClick={() => !isTaken && onSelectSpot(num)}
                style={{
                  ...spotStyle,
                  background: isTaken ? '#e74c3c' : '#2ecc71',
                  cursor: isTaken ? 'not-allowed' : 'pointer'
                }}
              >
                {num}
              </div>
            );
          })}
        </div>
        
        <button onClick={onCancel} style={{marginTop: '20px', width:'100%', padding:'10px'}}>
          Go Back
        </button>
      </div>
    </div>
  );
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 };
const gridCard = { background: 'white', padding: '20px', borderRadius: '15px', width: '300px', textAlign:'center' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '20px' };
const spotStyle = { height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', borderRadius: '5px' };

export default ParkingGrid;