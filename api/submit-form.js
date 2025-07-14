// This is a serverless function. 
// Its only job is to receive data from the form and securely forward it to GHL.

exports.handler = async function(event) {
  // Security check: Only allow POST requests.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    // Get the REAL GHL webhook URL from a secure environment variable.
    // You MUST set this in your Netlify project settings.
    const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL;

    if (!GHL_WEBHOOK_URL) {
      console.error('GHL_WEBHOOK_URL environment variable not set.');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Server configuration error.' }),
      };
    }

    // Get the data the form sent to us.
    const formData = JSON.parse(event.body);

    // Forward the data to the real GoHighLevel webhook.
    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    // If GHL returned an error, pass that error back to the form.
    if (!response.ok) {
      const errorData = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify(errorData),
      };
    }

    // If everything was successful, return a success message to the form.
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully forwarded to GHL' }),
    };

  } catch (error) {
    console.error('Error in serverless function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An internal error occurred.' }),
    };
  }
};
