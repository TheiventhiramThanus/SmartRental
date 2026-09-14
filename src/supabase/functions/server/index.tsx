import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a22c139e/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up route
app.post("/make-server-a22c139e/signup", async (c) => {
  const { email, password, name, role } = await c.req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: role || 'customer' },
    email_confirm: true
  });

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data);
});

// Seed demo users route
app.post("/make-server-a22c139e/seed-users", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return c.json({ error: 'Server configuration error: Missing Supabase credentials' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const users = [
      { email: 'customer@demo.com', password: 'customer123', role: 'customer', name: 'Demo Customer' },
      { email: 'staff@demo.com', password: 'staff123', role: 'staff', name: 'Demo Staff' },
      { email: 'admin@demo.com', password: 'admin123', role: 'admin', name: 'Demo Admin' }
    ];

    const results = [];
    
    // Fetch existing users to check for duplicates
    // Note: listUsers defaults to page 1, 50 users. Sufficient for this context.
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return c.json({ error: `Database error: ${listError.message}` }, 500);
    }

    const existingUsers = listData?.users || [];

    for (const user of users) {
      const existing = existingUsers.find(u => u.email === user.email);

      if (existing) {
        // Update the user to ensure password matches demo credentials
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existing.id,
          { 
            password: user.password,
            user_metadata: { name: user.name, role: user.role },
            email_confirm: true 
          }
        );

        if (updateError) {
          results.push({ email: user.email, status: 'error_updating', error: updateError.message });
        } else {
          results.push({ email: user.email, status: 'updated_password' });
        }
        continue;
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: { name: user.name, role: user.role },
        email_confirm: true
      });

      if (error) {
        results.push({ email: user.email, status: 'error', error: error.message });
      } else {
        results.push({ email: user.email, status: 'created' });
      }
    }

    return c.json({ results });
  } catch (err: any) {
    console.error("Unexpected error in seed-users:", err);
    return c.json({ error: `Internal error: ${err.message}` }, 500);
  }
});

Deno.serve(app.fetch);