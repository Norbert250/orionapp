// Simple endpoint to handle form abandonment
// This would be better as a serverless function
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'ABANDON_FORM') {
    fetch('/api/abandon-form', {
      method: 'POST',
      body: JSON.stringify(e.data.payload),
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
  }
});