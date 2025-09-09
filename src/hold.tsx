
// function Home() {
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
//       <header style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Loan App</h1>
//           <button onClick={() => navigate('/loans')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
//             Past Loans
//           </button>
//         </div>
//       </header>

//       <main style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
//         <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: '#333' }}>
//           Welcome to Your Loan Portal
//         </h2>
        
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
//           <button
//             onClick={() => navigate('/loan/pay')}
//             style={{ padding: '16px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
//           >
//             Pay Loan
//           </button>
          
//           <button
//             onClick={() => setShowModal(true)}
//             style={{ padding: '16px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
//           >
//             Request Loan
//           </button>
//         </div>

//         <p style={{ marginTop: '40px', color: '#666' }}>
//           Need help? Contact our support team for assistance.
//         </p>
//       </main>

//       {showModal && (
//         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
//           <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
//             <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>Select Your Sector</h3>
//             <p style={{ marginBottom: '24px', color: '#666', textAlign: 'center' }}>Are you from the Formal or Informal sector?</p>
            
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//               <button
//                 onClick={() => { setShowModal(false); navigate('/loan/request/formal'); }}
//                 style={{ padding: '20px', border: '2px solid #e9ecef', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
//                 onMouseOver={(e) => e.target.style.borderColor = '#007bff'}
//                 onMouseOut={(e) => e.target.style.borderColor = '#e9ecef'}
//               >
//                 <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>Formal Sector</div>
//                 <div style={{ fontSize: '14px', color: '#666' }}>Employed with regular salary and bank statements</div>
//               </button>
              
//               <button
//                 onClick={() => { setShowModal(false); navigate('/loan/request/informal'); }}
//                 style={{ padding: '20px', border: '2px solid #e9ecef', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
//                 onMouseOver={(e) => e.target.style.borderColor = '#007bff'}
//                 onMouseOut={(e) => e.target.style.borderColor = '#e9ecef'}
//               >
//                 <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>Informal Sector</div>
//                 <div style={{ fontSize: '14px', color: '#666' }}>Self-employed or irregular income</div>
//               </button>
//             </div>
            
//             <div style={{ textAlign: 'center', marginTop: '20px' }}>
//               <button
//                 onClick={() => setShowModal(false)}
//                 style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function InformalLoanForm() {
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [assets, setAssets] = useState([]);
//   const [homeFloor, setHomeFloor] = useState(null);
//   const [hasBankAccount, setHasBankAccount] = useState(false);
//   const [bankStatements, setBankStatements] = useState([]);
//   const [mpesaHistory, setMpesaHistory] = useState([]);
//   const [callLogs, setCallLogs] = useState([]);
//   const [amount, setAmount] = useState('');
//   const [proofOfIllness, setProofOfIllness] = useState(null);
//   const [repaymentDate, setRepaymentDate] = useState('');
//   const [hasRetailBusiness, setHasRetailBusiness] = useState(false);
//   const [businessRegNo, setBusinessRegNo] = useState('');
//   const [businessLocation, setBusinessLocation] = useState('');
//   const [shopPhoto, setShopPhoto] = useState(null);
//   const [guarantor1, setGuarantor1] = useState({ name: '', id: '', contact: '' });
//   const [guarantor2, setGuarantor2] = useState({ name: '', id: '', contact: '' });
//   const [lowValueAssets, setLowValueAssets] = useState([]);

//   const checkAssetValue = (file) => {
//     const fileName = file.name.toLowerCase();
//     let value = Math.floor(Math.random() * 10000) + 1000;
//     let requiresLicense = false;
    
//     if (fileName.includes('car') || fileName.includes('vehicle') || fileName.includes('motorcycle')) {
//       value = Math.floor(Math.random() * 50000) + 10000;
//       requiresLicense = true;
//     } else if (fileName.includes('jewelry') || fileName.includes('gold')) {
//       value = Math.floor(Math.random() * 20000) + 5000;
//     } else if (fileName.includes('phone') || fileName.includes('laptop')) {
//       value = Math.floor(Math.random() * 2000) + 200;
//     }
    
//     return { value, requiresLicense, isLowValue: value < 1000 };
//   };

//   const handleAssetUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newAssets = [];
//     const newLowValueAssets = [];
    
//     files.forEach((file, index) => {
//       const { value, requiresLicense, isLowValue } = checkAssetValue(file);
//       const asset = { file, value, requiresLicense, license: null, id: Date.now() + index };
//       newAssets.push(asset);
      
//       if (isLowValue) {
//         newLowValueAssets.push(asset);
//         alert(`⚠️ Low value asset detected: ${file.name} ($${value}). Consider uploading a more valuable asset.`);
//       }
      
//       if (requiresLicense) {
//         alert(`📄 License required for: ${file.name}. Please upload the license document.`);
//       }
//     });
    
//     setAssets(prev => [...prev, ...newAssets]);
//     setLowValueAssets(prev => [...prev, ...newLowValueAssets]);
//   };

//   const handleLicenseUpload = (assetId, file) => {
//     setAssets(prev => prev.map(asset => 
//       asset.id === assetId ? { ...asset, license: file } : asset
//     ));
//   };

//   const removeAsset = (assetId) => {
//     setAssets(prev => prev.filter(asset => asset.id !== assetId));
//     setLowValueAssets(prev => prev.filter(asset => asset.id !== assetId));
//   };

//   const handleNext = () => {
//     if (currentStep === 1) {
//       if (assets.length < 3) {
//         alert('Please upload at least 3 asset pictures');
//         return;
//       }
//       if (!homeFloor) {
//         alert('Please upload a photo of your home floor');
//         return;
//       }
//       setCurrentStep(2);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!amount || !repaymentDate) {
//       alert('Please fill in loan amount and repayment date');
//       return;
//     }
//     if (!guarantor1.name || !guarantor1.id || !guarantor1.contact || !guarantor2.name || !guarantor2.id || !guarantor2.contact) {
//       alert('Please provide complete information for both guarantors');
//       return;
//     }
    
//     try {
//       const formData = {
//         sector: 'informal',
//         assets: assets.map(asset => ({
//           fileName: asset.file.name,
//           fileSize: asset.file.size,
//           value: asset.value,
//           requiresLicense: asset.requiresLicense,
//           hasLicense: !!asset.license
//         })),
//         homeFloorPhoto: homeFloor ? { fileName: homeFloor.name, fileSize: homeFloor.size } : null,
//         hasBankAccount,
//         bankStatements: bankStatements.map(file => ({ fileName: file.name, fileSize: file.size })),
//         mpesaHistory: mpesaHistory.map(file => ({ fileName: file.name, fileSize: file.size })),
//         callLogs: callLogs.map(file => ({ fileName: file.name, fileSize: file.size })),
//         amountRequested: parseFloat(amount),
//         proofOfIllness: proofOfIllness ? { fileName: proofOfIllness.name, fileSize: proofOfIllness.size } : null,
//         repaymentDate,
//         hasRetailBusiness,
//         businessRegistrationNumber: businessRegNo,
//         businessLocation,
//         shopPicture: shopPhoto ? { fileName: shopPhoto.name, fileSize: shopPhoto.size } : null,
//         guarantors: [
//           { name: guarantor1.name, idNumber: guarantor1.id, contact: guarantor1.contact, idPhoto: guarantor1.idPhoto ? { fileName: guarantor1.idPhoto.name } : null },
//           { name: guarantor2.name, idNumber: guarantor2.id, contact: guarantor2.contact, idPhoto: guarantor2.idPhoto ? { fileName: guarantor2.idPhoto.name } : null }
//         ],
//         submittedAt: new Date().toISOString()
//       };
      
//       console.log('Submitting informal loan form:', formData);
//       const response = await api.post('/submitform', formData);
//       console.log('Submission response:', response.data);
      
//       navigate(`/loan/pending/${response.data.id}`);
//     } catch (error) {
//       console.error('Submission error:', error);
//       alert('Error submitting application: ' + (error.response?.data?.error || error.message));
//     }
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
//       <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#333' }}>Informal Sector Loan Application</h1>
        
//         {/* Progress Indicator */}
//         <div style={{ marginBottom: '32px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//             <div style={{ flex: 1, height: '4px', backgroundColor: '#007bff', borderRadius: '2px' }}></div>
//             <div style={{ flex: 1, height: '4px', backgroundColor: currentStep === 2 ? '#007bff' : '#e5e7eb', borderRadius: '2px', marginLeft: '8px' }}></div>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
//             <span>Step 1: Assets & Verification</span>
//             <span>Step 2: Loan Details & Guarantors</span>
//           </div>
//         </div>
        
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
//           {currentStep === 1 && (
//             <>
//               {/* Asset Upload */}
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Upload 3-10 Images of Your Most Valuable Assets *</label>
//                 <input type="file" multiple accept="image/*" onChange={handleAssetUpload} disabled={assets.length >= 10} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{assets.length}/10 assets uploaded (minimum 3 required)</p>
                
//                 {assets.map((asset) => (
//                   <div key={asset.id} style={{ padding: '12px', backgroundColor: asset.value < 1000 ? '#fff5f5' : '#f8f9fa', margin: '8px 0', borderRadius: '4px', border: asset.value < 1000 ? '1px solid #fecaca' : '1px solid #e5e7eb' }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                       <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
//                         <img src={URL.createObjectURL(asset.file)} alt={asset.file.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
//                         <div style={{ flex: 1 }}>
//                           <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{asset.file.name}</p>
//                           <p style={{ margin: '0 0 4px 0', color: '#666' }}>Value: ${asset.value.toLocaleString()}</p>
//                         {asset.value < 1000 && (
//                           <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>⚠️ Low asset value - consider uploading a more valuable asset</p>
//                         )}
//                         {asset.requiresLicense && (
//                           <div style={{ marginTop: '8px' }}>
//                             <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>License Required:</label>
//                             <input type="file" accept="image/*,.pdf" onChange={(e) => handleLicenseUpload(asset.id, e.target.files[0])} style={{ fontSize: '12px', padding: '4px' }} />
//                             {asset.license && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ License uploaded: {asset.license.name}</p>}
//                           </div>
//                         )}
//                         </div>
//                       </div>
//                       <button type="button" onClick={() => removeAsset(asset.id)} style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
//                     </div>
//                   </div>
//                 ))}
                
//                 {lowValueAssets.length > 0 && (
//                   <div style={{ padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px', marginTop: '8px' }}>
//                     <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#92400e' }}>⚠️ Low Value Assets Detected</p>
//                     <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>Consider replacing these low-value items:</p>
//                     <ul style={{ margin: '8px 0 0 20px', color: '#92400e' }}>
//                       {lowValueAssets.map(asset => <li key={asset.id}>{asset.file.name} (${asset.value.toLocaleString()})</li>)}
//                     </ul>
//                   </div>
//                 )}
//               </div>

//               {/* Household Verification */}
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Photo of Your Home Floor *</label>
//                 <input type="file" accept="image/*" onChange={(e) => setHomeFloor(e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 {homeFloor && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ Home floor photo uploaded: {homeFloor.name}</p>}
//               </div>

//               {/* Financial Information */}
//               <div>
//                 <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Financial Information</h3>
//                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '12px' }}>
//                   <input type="checkbox" checked={hasBankAccount} onChange={(e) => setHasBankAccount(e.target.checked)} />
//                   Do you have a bank account?
//                 </label>
//                 {hasBankAccount && (
//                   <div style={{ marginBottom: '16px' }}>
//                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Bank Statements (6 months) *</label>
//                     <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setBankStatements(Array.from(e.target.files))} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                     {bankStatements.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ {bankStatements.length} bank statement(s) uploaded</p>}
//                   </div>
//                 )}
                
//                 <div style={{ marginBottom: '16px' }}>
//                   <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>M-Pesa Transaction History (6 months) *</label>
//                   <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setMpesaHistory(Array.from(e.target.files))} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   {mpesaHistory.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ {mpesaHistory.length} M-Pesa record(s) uploaded</p>}
//                 </div>
                
//                 <div>
//                   <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Call Logs (6 months) *</label>
//                   <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={(e) => setCallLogs(Array.from(e.target.files))} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   {callLogs.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ {callLogs.length} call log document(s) uploaded</p>}
//                 </div>
//               </div>
//             </>
//           )}

//           {currentStep === 2 && (
//             <>
//               {/* Loan Details */}
//               <div>
//                 <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Loan Details</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
//                   <div>
//                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Amount Requested ($) *</label>
//                     <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="100" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Repayment Date *</label>
//                     <input type="date" value={repaymentDate} onChange={(e) => setRepaymentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   </div>
//                 </div>
//                 <div>
//                   <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Proof of Illness (Optional)</label>
//                   <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProofOfIllness(e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   {proofOfIllness && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ Proof of illness uploaded: {proofOfIllness.name}</p>}
//                 </div>
//               </div>

//               {/* Retail Business Information */}
//               <div>
//                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '12px' }}>
//                   <input type="checkbox" checked={hasRetailBusiness} onChange={(e) => setHasRetailBusiness(e.target.checked)} />
//                   Do you own a retail business?
//                 </label>
//                 {hasRetailBusiness && (
//                   <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
//                       <div>
//                         <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Business Registration Number *</label>
//                         <input type="text" value={businessRegNo} onChange={(e) => setBusinessRegNo(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                       </div>
//                       <div>
//                         <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Business Location *</label>
//                         <input type="text" value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                       </div>
//                     </div>
//                     <div>
//                       <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Photo of Shop *</label>
//                       <input type="file" accept="image/*" onChange={(e) => setShopPhoto(e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                       {shopPhoto && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ Shop photo uploaded: {shopPhoto.name}</p>}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Guarantor Information */}
//               <div>
//                 <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Guarantor Information (2 required) *</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
//                   <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
//                     <h4 style={{ marginBottom: '12px', color: '#333' }}>Guarantor 1</h4>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                       <div>
//                         <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Upload ID Photo *</label>
//                         <input type="file" accept="image/*" onChange={(e) => {
//                           const file = e.target.files[0];
//                           if (file) {
//                             // Mock ID extraction
//                             const mockName = 'John Doe Smith';
//                             const mockId = '12345678';
//                             setGuarantor1({...guarantor1, idPhoto: file, name: mockName, id: mockId});
//                           }
//                         }} style={{ fontSize: '12px', padding: '4px', width: '100%' }} />
//                         {guarantor1.idPhoto && (
//                           <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
//                             <p style={{ fontSize: '12px', color: '#16a34a', margin: '0 0 4px 0' }}>✓ ID uploaded: {guarantor1.idPhoto.name}</p>
//                             <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>Name: {guarantor1.name}</p>
//                             <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>ID Number: {guarantor1.id}</p>
//                           </div>
//                         )}
//                       </div>
//                       <input type="tel" placeholder="Contact Information" value={guarantor1.contact} onChange={(e) => setGuarantor1({...guarantor1, contact: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                     </div>
//                   </div>
//                   <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
//                     <h4 style={{ marginBottom: '12px', color: '#333' }}>Guarantor 2</h4>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                       <div>
//                         <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Upload ID Photo *</label>
//                         <input type="file" accept="image/*" onChange={(e) => {
//                           const file = e.target.files[0];
//                           if (file) {
//                             // Mock ID extraction
//                             const mockName = 'Jane Mary Wilson';
//                             const mockId = '87654321';
//                             setGuarantor2({...guarantor2, idPhoto: file, name: mockName, id: mockId});
//                           }
//                         }} style={{ fontSize: '12px', padding: '4px', width: '100%' }} />
//                         {guarantor2.idPhoto && (
//                           <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
//                             <p style={{ fontSize: '12px', color: '#16a34a', margin: '0 0 4px 0' }}>✓ ID uploaded: {guarantor2.idPhoto.name}</p>
//                             <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>Name: {guarantor2.name}</p>
//                             <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>ID Number: {guarantor2.id}</p>
//                           </div>
//                         )}
//                       </div>
//                       <input type="tel" placeholder="Contact Information" value={guarantor2.contact} onChange={(e) => setGuarantor2({...guarantor2, contact: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {currentStep === 1 ? (
//             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//               <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                 Cancel
//               </button>
//               <button onClick={handleNext} disabled={assets.length < 3 || !homeFloor} style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: (assets.length < 3 || !homeFloor) ? 0.5 : 1 }}>
//                 Next Step
//               </button>
//             </div>
//           ) : (
//             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//               <button onClick={() => setCurrentStep(1)} style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                 Previous
//               </button>
//               <button onClick={handleSubmit} style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                 Submit Application
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function FormalLoanForm() {
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [assets, setAssets] = useState([]);
//   const [homeFloor, setHomeFloor] = useState(null);
//   const [bankStatements, setBankStatements] = useState([]);
//   const [salaryPayslips, setSalaryPayslips] = useState([]);
//   const [mpesaHistory, setMpesaHistory] = useState([]);
//   const [callLogs, setCallLogs] = useState([]);
//   const [amount, setAmount] = useState('');
//   const [proofOfIllness, setProofOfIllness] = useState(null);
//   const [repaymentDate, setRepaymentDate] = useState('');
//   const [hasRetailBusiness, setHasRetailBusiness] = useState(false);
//   const [businessRegNo, setBusinessRegNo] = useState('');
//   const [businessLocation, setBusinessLocation] = useState('');
//   const [shopPhoto, setShopPhoto] = useState(null);
//   const [guarantor1, setGuarantor1] = useState({ name: '', id: '', contact: '' });
//   const [guarantor2, setGuarantor2] = useState({ name: '', id: '', contact: '' });
//   const [lowValueAssets, setLowValueAssets] = useState([]);

//   const checkAssetValue = (file) => {
//     const fileName = file.name.toLowerCase();
//     let value = Math.floor(Math.random() * 10000) + 1000;
//     let requiresLicense = false;
    
//     if (fileName.includes('car') || fileName.includes('vehicle') || fileName.includes('motorcycle')) {
//       value = Math.floor(Math.random() * 50000) + 10000;
//       requiresLicense = true;
//     } else if (fileName.includes('jewelry') || fileName.includes('gold')) {
//       value = Math.floor(Math.random() * 20000) + 5000;
//     } else if (fileName.includes('phone') || fileName.includes('laptop')) {
//       value = Math.floor(Math.random() * 2000) + 200;
//     }
    
//     return { value, requiresLicense, isLowValue: value < 1000 };
//   };

//   const handleAssetUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newAssets = [];
//     const newLowValueAssets = [];
    
//     files.forEach((file, index) => {
//       const { value, requiresLicense, isLowValue } = checkAssetValue(file);
//       const asset = { file, value, requiresLicense, license: null, id: Date.now() + index };
//       newAssets.push(asset);
      
//       if (isLowValue) {
//         newLowValueAssets.push(asset);
//         alert(`⚠️ Low value asset detected: ${file.name} (${value}). Consider uploading a more valuable asset.`);
//       }
      
//       if (requiresLicense) {
//         alert(`📄 License required for: ${file.name}. Please upload the license document.`);
//       }
//     });
    
//     setAssets(prev => [...prev, ...newAssets]);
//     setLowValueAssets(prev => [...prev, ...newLowValueAssets]);
//   };

//   const handleLicenseUpload = (assetId, file) => {
//     setAssets(prev => prev.map(asset => 
//       asset.id === assetId ? { ...asset, license: file } : asset
//     ));
//   };

//   const removeAsset = (assetId) => {
//     setAssets(prev => prev.filter(asset => asset.id !== assetId));
//     setLowValueAssets(prev => prev.filter(asset => asset.id !== assetId));
//   };

//   const handleNext = () => {
//     if (currentStep === 1) {
//       if (assets.length < 3) {
//         alert('Please upload at least 3 asset pictures');
//         return;
//       }
//       if (!homeFloor) {
//         alert('Please upload a photo of your home floor');
//         return;
//       }
//       if (bankStatements.length === 0 || salaryPayslips.length === 0) {
//         alert('Please upload bank statements and salary payslips');
//         return;
//       }
//       setCurrentStep(2);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!amount || !repaymentDate) {
//       alert('Please fill in loan amount and repayment date');
//       return;
//     }
//     if (!guarantor1.name || !guarantor1.id || !guarantor1.contact || !guarantor2.name || !guarantor2.id || !guarantor2.contact) {
//       alert('Please provide complete information for both guarantors');
//       return;
//     }
    
//     try {
//       const formData = {
//         sector: 'formal',
//         assets: assets.map(asset => ({
//           fileName: asset.file.name,
//           fileSize: asset.file.size,
//           value: asset.value,
//           requiresLicense: asset.requiresLicense,
//           hasLicense: !!asset.license
//         })),
//         homeFloorPhoto: homeFloor ? { fileName: homeFloor.name, fileSize: homeFloor.size } : null,
//         bankStatements: bankStatements.map(file => ({ fileName: file.name, fileSize: file.size })),
//         salaryPayslips: salaryPayslips.map(file => ({ fileName: file.name, fileSize: file.size })),
//         mpesaHistory: mpesaHistory.map(file => ({ fileName: file.name, fileSize: file.size })),
//         callLogs: callLogs.map(file => ({ fileName: file.name, fileSize: file.size })),
//         amountRequested: parseFloat(amount),
//         proofOfIllness: proofOfIllness ? { fileName: proofOfIllness.name, fileSize: proofOfIllness.size } : null,
//         repaymentDate,
//         hasRetailBusiness,
//         businessRegistrationNumber: businessRegNo,
//         businessLocation,
//         shopPicture: shopPhoto ? { fileName: shopPhoto.name, fileSize: shopPhoto.size } : null,
//         guarantors: [
//           { name: guarantor1.name, idNumber: guarantor1.id, contact: guarantor1.contact, idPhoto: guarantor1.idPhoto ? { fileName: guarantor1.idPhoto.name } : null },
//           { name: guarantor2.name, idNumber: guarantor2.id, contact: guarantor2.contact, idPhoto: guarantor2.idPhoto ? { fileName: guarantor2.idPhoto.name } : null }
//         ],
//         submittedAt: new Date().toISOString()
//       };
      
//       console.log('Submitting formal loan form:', formData);
//       const response = await api.post('/submitform', formData);
//       console.log('Submission response:', response.data);
      
//       navigate(`/loan/pending/${response.data.id}`);
//     } catch (error) {
//       console.error('Submission error:', error);
//       alert('Error submitting application: ' + (error.response?.data?.error || error.message));
//     }
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
//       <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#333' }}>Formal Sector Loan Application</h1>
        
//         {/* Progress Indicator */}
//         <div style={{ marginBottom: '32px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//             <div style={{ flex: 1, height: '4px', backgroundColor: '#007bff', borderRadius: '2px' }}></div>
//             <div style={{ flex: 1, height: '4px', backgroundColor: currentStep === 2 ? '#007bff' : '#e5e7eb', borderRadius: '2px', marginLeft: '8px' }}></div>
//           </div>
//           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
//             <span>Step 1: Assets & Documents</span>
//             <span>Step 2: Loan Details & Guarantors</span>
//           </div>
//         </div>
        
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
//           {currentStep === 1 && (
//             <>
//               {/* Asset Upload - Same as Informal */}
//               <div>
//             <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Upload Asset Pictures (3-10 required) *</label>
//             <input type="file" multiple accept="image/*" onChange={handleAssetUpload} disabled={assets.length >= 10} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//             <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{assets.length}/10 assets uploaded (minimum 3 required)</p>
            
//             {assets.map((asset) => (
//               <div key={asset.id} style={{ padding: '12px', backgroundColor: asset.value < 1000 ? '#fff5f5' : '#f8f9fa', margin: '8px 0', borderRadius: '4px', border: asset.value < 1000 ? '1px solid #fecaca' : '1px solid #e5e7eb' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                   <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
//                     <img src={URL.createObjectURL(asset.file)} alt={asset.file.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
//                     <div style={{ flex: 1 }}>
//                       <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{asset.file.name}</p>
//                       <p style={{ margin: '0 0 4px 0', color: '#666' }}>Value: ${asset.value.toLocaleString()}</p>
//                     {asset.value < 1000 && (
//                       <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>⚠️ Low asset value - consider uploading a more valuable asset</p>
//                     )}
//                     {asset.requiresLicense && (
//                       <div style={{ marginTop: '8px' }}>
//                         <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>License Required:</label>
//                         <input type="file" accept="image/*,.pdf" onChange={(e) => handleLicenseUpload(asset.id, e.target.files[0])} style={{ fontSize: '12px', padding: '4px' }} />
//                         {asset.license && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ License uploaded: {asset.license.name}</p>}
//                       </div>
//                     )}
//                     </div>
//                   </div>
//                   <button type="button" onClick={() => removeAsset(asset.id)} style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
//                 </div>
//               </div>
//             ))}
            
//             {lowValueAssets.length > 0 && (
//               <div style={{ padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px', marginTop: '8px' }}>
//                 <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#92400e' }}>⚠️ Low Value Assets Detected</p>
//                 <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>Consider replacing these low-value items:</p>
//                 <ul style={{ margin: '8px 0 0 20px', color: '#92400e' }}>
//                   {lowValueAssets.map(asset => <li key={asset.id}>{asset.file.name} (${asset.value.toLocaleString()})</li>)}
//                 </ul>
//               </div>
//             )}
//           </div>

//           {/* Home Floor Photo */}
//           <div>
//             <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Photo of Your Home Floor *</label>
//             <input type="file" accept="image/*" onChange={(e) => setHomeFloor(e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//             {homeFloor && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ Home floor photo uploaded: {homeFloor.name}</p>}
//           </div>

//           {/* Required Documents for Formal Sector */}
//           <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
//             <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0c4a6e' }}>Required Financial Documents</h3>
            
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Bank Statements (6 months) *</label>
//                 <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setBankStatements(Array.from(e.target.files))} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 {bankStatements.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ {bankStatements.length} bank statement(s) uploaded</p>}
//               </div>
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Salary Payslips (6 months) *</label>
//                 <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setSalaryPayslips(Array.from(e.target.files))} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 {salaryPayslips.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ {salaryPayslips.length} salary payslip(s) uploaded</p>}
//               </div>
//             </div>
            
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>M-Pesa Transaction Records (6 months) *</label>
//                 <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setMpesaHistory(Array.from(e.target.files))} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 {mpesaHistory.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ {mpesaHistory.length} M-Pesa record(s) uploaded</p>}
//               </div>
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Call Logs (6 months) *</label>
//                 <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={(e) => setCallLogs(Array.from(e.target.files))} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 {callLogs.length > 0 && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ {callLogs.length} call log document(s) uploaded</p>}
//               </div>
//             </div>
//           </div>
//             </>
//           )}

//           {currentStep === 2 && (
//             <>
//               {/* Loan Details */}
//           <div>
//             <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Loan Details</h3>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Amount Requested ($) *</label>
//                 <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="100" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//               </div>
//               <div>
//                 <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Repayment Date *</label>
//                 <input type="date" value={repaymentDate} onChange={(e) => setRepaymentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//               </div>
//             </div>
//             <div>
//               <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Proof of Illness (Optional)</label>
//               <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProofOfIllness(e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//               {proofOfIllness && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ Proof of illness uploaded: {proofOfIllness.name}</p>}
//             </div>
//           </div>

//           {/* Retail Business */}
//           <div>
//             <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '12px' }}>
//               <input type="checkbox" checked={hasRetailBusiness} onChange={(e) => setHasRetailBusiness(e.target.checked)} />
//               Do you own a retail business?
//             </label>
//             {hasRetailBusiness && (
//               <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
//                   <div>
//                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Business Registration Number *</label>
//                     <input type="text" value={businessRegNo} onChange={(e) => setBusinessRegNo(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Business Location *</label>
//                     <input type="text" value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   </div>
//                 </div>
//                 <div>
//                   <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Photo of Shop *</label>
//                   <input type="file" accept="image/*" onChange={(e) => setShopPhoto(e.target.files[0])} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                   {shopPhoto && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ Shop photo uploaded: {shopPhoto.name}</p>}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Guarantors */}
//           <div>
//             <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Guarantors (2 required) *</h3>
//             <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>Note: Algorithm will verify guarantor agreement in the next phase</p>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
//               <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
//                 <h4 style={{ marginBottom: '12px', color: '#333' }}>Guarantor 1</h4>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                   <div>
//                     <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Upload ID Photo *</label>
//                     <input type="file" accept="image/*" onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (file) {
//                         // Mock ID extraction
//                         const mockName = 'John Doe Smith';
//                         const mockId = '12345678';
//                         setGuarantor1({...guarantor1, idPhoto: file, name: mockName, id: mockId});
//                       }
//                     }} style={{ fontSize: '12px', padding: '4px', width: '100%' }} />
//                     {guarantor1.idPhoto && (
//                       <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
//                         <p style={{ fontSize: '12px', color: '#16a34a', margin: '0 0 4px 0' }}>✓ ID uploaded: {guarantor1.idPhoto.name}</p>
//                         <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>Name: {guarantor1.name}</p>
//                         <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>ID Number: {guarantor1.id}</p>
//                       </div>
//                     )}
//                   </div>
//                   <input type="tel" placeholder="Contact Information" value={guarantor1.contact} onChange={(e) => setGuarantor1({...guarantor1, contact: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 </div>
//               </div>
//               <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
//                 <h4 style={{ marginBottom: '12px', color: '#333' }}>Guarantor 2</h4>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                   <div>
//                     <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Upload ID Photo *</label>
//                     <input type="file" accept="image/*" onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (file) {
//                         // Mock ID extraction
//                         const mockName = 'Jane Mary Wilson';
//                         const mockId = '87654321';
//                         setGuarantor2({...guarantor2, idPhoto: file, name: mockName, id: mockId});
//                       }
//                     }} style={{ fontSize: '12px', padding: '4px', width: '100%' }} />
//                     {guarantor2.idPhoto && (
//                       <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
//                         <p style={{ fontSize: '12px', color: '#16a34a', margin: '0 0 4px 0' }}>✓ ID uploaded: {guarantor2.idPhoto.name}</p>
//                         <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>Name: {guarantor2.name}</p>
//                         <p style={{ fontSize: '12px', color: '#333', margin: '2px 0' }}>ID Number: {guarantor2.id}</p>
//                       </div>
//                     )}
//                   </div>
//                   <input type="tel" placeholder="Contact Information" value={guarantor2.contact} onChange={(e) => setGuarantor2({...guarantor2, contact: e.target.value})} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
//                 </div>
//               </div>
//             </div>
//           </div>
//             </>
//           )}

//           {currentStep === 1 ? (
//             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//               <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                 Cancel
//               </button>
//               <button onClick={handleNext} disabled={assets.length < 3 || !homeFloor || bankStatements.length === 0 || salaryPayslips.length === 0} style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: (assets.length < 3 || !homeFloor || bankStatements.length === 0 || salaryPayslips.length === 0) ? 0.5 : 1 }}>
//                 Next Step
//               </button>
//             </div>
//           ) : (
//             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//               <button onClick={() => setCurrentStep(1)} style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                 Previous
//               </button>
//               <button onClick={handleSubmit} style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//                 Submit Application
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function PayLoan() {
//   const navigate = useNavigate();
//   const mockLoans = [
//     { id: 'LOAN-001', principal: 5000, interest: 750, dueDate: '2024-03-15', status: 'active' },
//     { id: 'LOAN-002', principal: 2500, interest: 375, dueDate: '2024-02-28', status: 'overdue' }
//   ];

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
//       <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//           <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Pay Loan</h1>
//           <button onClick={() => navigate('/')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back</button>
//         </div>
        
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           {mockLoans.map(loan => (
//             <div key={loan.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: loan.status === 'overdue' ? '#fff5f5' : 'white' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                   <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{loan.id}</h3>
//                   <p style={{ margin: '4px 0', color: '#666' }}>Principal: ${loan.principal.toLocaleString()}</p>
//                   <p style={{ margin: '4px 0', color: '#666' }}>Interest: ${loan.interest.toLocaleString()}</p>
//                   <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Total: ${(loan.principal + loan.interest).toLocaleString()}</p>
//                   <p style={{ margin: '4px 0', color: loan.status === 'overdue' ? 'red' : '#666' }}>Due: {loan.dueDate}</p>
//                 </div>
//                 <button 
//                   onClick={() => alert(`Payment processed for ${loan.id}`)}
//                   style={{ padding: '12px 24px', backgroundColor: loan.status === 'overdue' ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
//                 >
//                   Pay Now
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function PastLoans() {
//   const navigate = useNavigate();
//   const mockPastLoans = [
//     { id: 'LOAN-003', amount: 3000, status: 'completed', sector: 'informal', date: '2023-12-15' },
//     { id: 'LOAN-004', amount: 8000, status: 'completed', sector: 'formal', date: '2023-11-30' }
//   ];

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
//       <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//           <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Past Loans</h1>
//           <button onClick={() => navigate('/')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Back</button>
//         </div>
        
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//           {mockPastLoans.map(loan => (
//             <div key={loan.id} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <div>
//                 <h3 style={{ margin: '0 0 4px 0' }}>{loan.id}</h3>
//                 <p style={{ margin: '2px 0', color: '#666' }}>Amount: ${loan.amount.toLocaleString()}</p>
//                 <p style={{ margin: '2px 0', color: '#666' }}>Sector: {loan.sector}</p>
//                 <p style={{ margin: '2px 0', color: '#666' }}>Date: {loan.date}</p>
//               </div>
//               <span style={{ padding: '4px 12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
//                 {loan.status}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function LoanPending() {
//   const navigate = useNavigate();
//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
//       <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#333' }}>Loan Application Status</h1>
//         <div style={{ marginBottom: '24px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
//             <div style={{ width: '24px', height: '24px', backgroundColor: '#28a745', borderRadius: '50%', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</div>
//             <span>Application Submitted</span>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
//             <div style={{ width: '24px', height: '24px', backgroundColor: '#007bff', borderRadius: '50%', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>2</div>
//             <span>Document Verification (Current)</span>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
//             <div style={{ width: '24px', height: '24px', backgroundColor: '#6c757d', borderRadius: '50%', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>3</div>
//             <span>Approval Decision</span>
//           </div>
//         </div>
//         <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
//           Back to Home
//         </button>
//       </div>
//     </div>
//   );
// }