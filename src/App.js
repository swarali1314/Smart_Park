import React, { useEffect, useState, useMemo } from 'react'; 
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc, getDoc, updateDoc, addDoc, query, where, increment, serverTimestamp } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import BookingForm from './bookingForm'; 
import AuthForm from './AuthForm';
import './dashboard.css'; 

// --- MARKER ICONS ---
const greenIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', 
    iconSize: [25, 41], iconAnchor: [12, 41], className: 'available-glow' 
});
const redIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', 
    iconSize: [25, 41], iconAnchor: [12, 41] 
});
const userIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', 
    iconSize: [25, 41], iconAnchor: [12, 41] 
});

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

function MapRefresher({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 14); }, [center, map]);
  return null;
}

function LocationMarker({ setUserPos }) {
  const map = useMapEvents({
    locationfound(e) {
      setUserPos([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 14);
    },
  });
  useEffect(() => { map.locate(); }, [map]);
  return null;
}

function GridTimer({ expiry }) {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiry]);
  if (timeLeft <= 0) return null;
  return <div style={{fontSize: '10px', color: 'white'}}>{Math.floor(timeLeft/60)}m {timeLeft%60}s</div>;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(""); 
  const [view, setView] = useState('map'); 
  const [mode, setMode] = useState('login'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [slots, setSlots] = useState([]);
  const [history, setHistory] = useState([]);
  const [userPos, setUserPos] = useState([18.6298, 73.7997]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingGrid, setViewingGrid] = useState(null); 
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tempBookingData, setTempBookingData] = useState(null); 
  const [showPayment, setShowPayment] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState('qr'); 

  // --- STATS CALCULATION ---
  const calculateLiveStats = () => {
    let avail = 0;
    let occ = 0;
    slots.forEach(s => {
      const countTaken = Object.values(s.occupancy || {}).filter(spot => spot.isTaken && spot.expiry > Date.now()).length;
      occ += countTaken;
      avail += ((s.totalSlots || 6) - countTaken);
    });
    return { avail, occ };
  };
  const { avail, occ } = calculateLiveStats();

  const recommendedSlot = useMemo(() => {
    if (slots.length === 0) return null;
    return [...slots].sort((a, b) => {
      const distA = getDistance(userPos[0], userPos[1], parseFloat(a.lat), parseFloat(a.lng));
      const distB = getDistance(userPos[0], userPos[1], parseFloat(b.lat), parseFloat(b.lng));
      return distA - distB;
    })[0];
  }, [slots, userPos]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const unsubSlots = onSnapshot(collection(db, "Parking_Slots"), (snap) => {
      setSlots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const q = query(collection(db, "Bookings_History"), where("userEmail", "==", userEmail));
    const unsubHistory = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubSlots(); unsubHistory(); };
  }, [isLoggedIn, userEmail]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data.length > 0) setUserPos([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } catch (err) { alert("Search failed"); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const userRef = doc(db, "Users", formData.email.replace(/\./g, '_'));
    const snap = await getDoc(userRef);
    if (mode === 'register' || (snap.exists() && snap.data().password === formData.password)) {
        if(mode === 'register') await setDoc(userRef, formData);
        setUserEmail(formData.email); setIsLoggedIn(true);
    } else alert("Invalid Login!");
  };

  const processFinalBooking = async (appScheme = "") => {
    if (!tempBookingData) return;
    if (appScheme) {
      window.location.href = `${appScheme}upi://pay?pa=swaraligurav1@okaxis&am=${tempBookingData.price}`;
    }
    const expiryTime = Date.now() + (tempBookingData.details.duration * 60000);
    const spotKey = `spot_${selectedSlot.spotNum}`;
    try {
      await addDoc(collection(db, "Bookings_History"), { ...tempBookingData.details, userEmail, slotName: `${selectedSlot.name} (Spot ${selectedSlot.spotNum})`, amount: tempBookingData.price, createdAt: serverTimestamp(), date: new Date().toLocaleString() });
      await updateDoc(doc(db, "Parking_Slots", selectedSlot.id), { [`occupancy.${spotKey}`]: { isTaken: true, expiry: expiryTime }, occupiedCount: increment(1) });
      setIsSuccess(true);
    } catch (err) { alert("Booking Error"); }
  };

  if (!isLoggedIn) return <AuthForm mode={mode} setMode={setMode} formData={formData} setFormData={setFormData} handleAuth={handleAuth} />;

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo-section">
          <div className="logo-icon">🅿️</div>
          <div className="logo-text">SMART<span style={{color: '#10B981'}}>PARK</span></div>
        </div>
        <div className="nav-right">
          <div className="icon-btn" onClick={() => alert("All systems active.")}>🔔</div>
          <div className="user-profile">
            <div className="avatar">S</div>
            <span className="user-email-text"> | {userEmail} | </span>
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside className="sidebar" style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
          <div>
            <div className={`sidebar-item ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>📊 Dashboard</div>
            <div className={`sidebar-item ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>📜 History</div>
          </div>
          {/* LOGOUT BUTTON IS NOW PERMANENTLY IN SIDEBAR */}
          <div className="sidebar-item" onClick={() => setIsLoggedIn(false)} style={{color:'#ef4444', borderTop:'1px solid #334155'}}>🚪 Logout</div>
        </aside>

        <main className="main-area">
          {view === 'map' && (
            <>
              <div className="welcome-text">Welcome back, Swarali 👋</div>
              <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                <div className="stats-row" style={{flex:2, margin:0, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'15px'}}>
                    <div className="stat-card">
                      <span className="stat-label">Available</span>
                      <span className="stat-value">{avail}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Occupied</span>
                      <span className="stat-value">{occ}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Locations</span>
                      <span className="stat-value">{slots.length}</span>
                    </div>
                </div>
                <div className="recommendation-card" style={{flex:1, background:'linear-gradient(135deg, #064e3b, #065f46)', borderRadius:'12px', padding:'15px', color:'white', border:'1px solid #10B981', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                    <small style={{color:'#10B981', fontWeight:'bold'}}>SMART RECOMMENDATION</small>
                    <h4 style={{margin:'5px 0'}}>{recommendedSlot ? recommendedSlot.name : "Finding nearest..."}</h4>
                    <p style={{fontSize:'12px', opacity:0.8, margin:0}}>Optimal parking distance.</p>
                </div>
              </div>

              <div className="map-wrapper" style={{position:'relative'}}>
                <div className="floating-search">
                  <input className="search-input" placeholder="Search PCMC..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <button onClick={handleSearch} className="btn-emerald">EXPLORE</button>
                </div>
                <MapContainer center={userPos} zoom={13} style={{ height: '450px', width: '100%', borderRadius:'12px' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker setUserPos={setUserPos} />
                  <MapRefresher center={userPos} />
                  <Marker position={userPos} icon={userIcon} />
                  {slots.map(s => {
                    const currentOcc = Object.values(s.occupancy || {}).filter(x => x.isTaken && x.expiry > Date.now()).length;
                    const isFull = currentOcc >= (s.totalSlots || 6);
                    return (
                      <Marker key={s.id} position={[parseFloat(s.lat), parseFloat(s.lng)]} icon={isFull ? redIcon : greenIcon}>
                        <Tooltip direction="top"><b>{s.name}</b></Tooltip>
                        <Popup>
                          <div style={{textAlign:'center'}}>
                            <b>{s.name}</b><br/>
                            <p>{(s.totalSlots || 6) - currentOcc} spots left</p>
                            {!isFull && <button onClick={() => setViewingGrid(s)} className="btn-emerald">Select Spot</button>}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
              <div className="map-legend" style={{display:'flex', gap:'20px', marginTop:'15px', justifyContent:'center'}}>
                <div><span style={{color:'#10B981'}}>●</span> Available</div>
                <div><span style={{color:'#EF4444'}}>●</span> Full</div>
                <div><span style={{color:'#10B981'}}>⭐</span> Recommended</div>
              </div>
            </>
          )}

          {view === 'history' && (
            <div className="history-section">
              <h2>Booking History</h2>
              {history.map(h => (
                <div key={h.id} className="stat-card" style={{flexDirection:'row', justifyContent:'space-between', marginBottom:'10px'}}>
                  <div><strong>{h.slotName}</strong><br/><small>{h.date}</small></div>
                  <div>₹{h.amount}</div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {viewingGrid && (
        <div className="overlay">
          <div className="modal-glass">
            <h3>{viewingGrid.name}</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'15px', marginTop:'15px'}}>
              {[1,2,3,4,5,6].map(num => {
                const spot = viewingGrid.occupancy?.[`spot_${num}`] || { isTaken: false };
                const isReserved = spot.isTaken && spot.expiry > Date.now();
                return (
                  <div key={num} onClick={() => !isReserved && setSelectedSlot({...viewingGrid, spotNum: num})} className={`grid-spot ${isReserved ? 'taken' : 'available'}`}>
                    {num} {isReserved && <GridTimer expiry={spot.expiry} />}
                  </div>
                );
              })}
            </div>
            <button className="btn-cancel" onClick={() => setViewingGrid(null)}>Close</button>
          </div>
        </div>
      )}

      {selectedSlot && !showPayment && (
        <BookingForm slot={selectedSlot} onCancel={() => setSelectedSlot(null)} onConfirm={(d, p) => { setTempBookingData({details: d, price: p}); setShowPayment(true); setPaymentStep('qr'); }} />
      )}

      {showPayment && (
        <div className="overlay">
          <div className="modal-glass" style={{textAlign:'center'}}>
            {isSuccess ? (
              <div>
                <h1>✅</h1><h2>Confirmed!</h2>
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSlot.lat},${selectedSlot.lng}`)} className="btn-emerald">START GPS</button>
                <button onClick={() => { setIsSuccess(false); setShowPayment(false); setSelectedSlot(null); setViewingGrid(null); }} className="btn-cancel">Done</button>
              </div>
            ) : paymentStep === 'qr' ? (
              <>
                <h3>Pay ₹{tempBookingData?.price}</h3>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=swaraligurav1@okaxis&am=${tempBookingData?.price}`} alt="QR" style={{background:'white', padding:'10px', borderRadius:'10px', margin:'15px 0'}} />
                <button onClick={() => setPaymentStep('options')} className="btn-emerald" style={{width:'100%'}}>USE UPI APP</button>
                <button onClick={() => processFinalBooking()} className="btn-emerald" style={{width:'100%', marginTop:'10px', background:'#3b82f6'}}>I HAVE PAID</button>
                <button onClick={() => setShowPayment(false)} className="btn-cancel">Cancel</button>
              </>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                <button onClick={() => processFinalBooking('googlepay://')} className="btn-upi">Google Pay</button>
                <button onClick={() => processFinalBooking('phonepe://')} className="btn-upi">PhonePe</button>
                <button onClick={() => setPaymentStep('qr')} className="btn-cancel">Back</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;