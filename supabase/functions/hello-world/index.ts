declare const Deno: { serve: (handler: (req: Request) => Response | Promise<Response>) => void };

Deno.serve(async (req) => {
    let name = "World"; // Default value
    
    try {
      // Check if there's a request body
      if (req.body) {
        const body = await req.json();
        
        // Handle different input formats
        if (typeof body === 'string') {
          name = body; // If the body is just a string, use it as the name
        } else if (body && typeof body === 'object' && body.name) {
          name = body.name; // If the body is an object with a name property
        }
      }
      
      const url = new URL(req.url);
      const nameParam = url.searchParams.get('name');
      if (nameParam) name = nameParam;
      
    } catch (error) {
      // If JSON parsing fails, just use the default "World"
      console.log('JSON parsing failed, using default name:', error);
    }
    
    const data = {
      message: `Hello ${name}!`,
    };
  
    return new Response(JSON.stringify(data), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  });