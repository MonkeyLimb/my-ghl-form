// This is a serverless function formatted for Vercel.
// It receives data from the form and securely forwards it to GHL.

export default async function handler(request, response) {
  // Security check: Only allow POST requests.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Get the REAL GHL webhook URL from the secure environment variable.
    const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL;

    if (!GHL_WEBHOOK_URL) {
      console.error('GHL_WEBHOOK_URL environment variable not set.');
      return response.status(500).json({ message: 'Server configuration error.' });
    }

    // Get the data the form sent to us. Vercel automatically parses the body.
    const formData = request.body;

    // Forward the data to the real GoHighLevel webhook.
    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    // If GHL returned an error, pass that error back to the form.
    if (!ghlResponse.ok) {
      const errorData = await ghlResponse.json();
      console.error('Error from GHL:', errorData);
      return response.status(ghlResponse.status).json(errorData);
    }

    // If everything was successful, return a success message to the form.
    return response.status(200).json({ message: 'Successfully forwarded to GHL' });

  } catch (error) {
    console.error('Error in serverless function:', error);
    return response.status(500).json({ message: 'An internal error occurred.' });
  }
}
