
import { createClient } from '@supabase/supabase-js';

// Mock Supabase Client for Demo Mode (Client-side only)
const STORAGE_KEY = 'sb-auth-token';

class MockSupabaseClient {
  private authListeners: any[] = [];

  // Helper methods implementation
  private async _signInWithPassword({ email, password }: any) {
    console.log('Mock SignIn:', email);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let user = null;

    if (email === 'customer@demo.com' && password === 'customer123') {
       user = { id: 'cust-123', email, user_metadata: { role: 'customer', name: 'John Doe' } };
    } else if (email === 'staff@demo.com' && password === 'staff123') {
       user = { id: 'staff-123', email, user_metadata: { role: 'staff', name: 'Staff Member' } };
    } else if (email === 'admin@demo.com' && password === 'admin123') {
       user = { id: 'admin-123', email, user_metadata: { role: 'admin', name: 'Admin User' } };
    } else {
       const role = email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'customer';
       user = { 
         id: 'mock-' + Date.now(), 
         email, 
         user_metadata: { 
           role, 
           name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) 
         } 
       };
    }

    if (user) {
      const session = { access_token: 'mock-token', user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      this._notifyAuthChange('SIGNED_IN', session);
      return { data: { user, session }, error: null };
    } else {
       return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }
  }

  private async _signInWithOAuth({ provider }: any) {
    console.log('Mock OAuth:', provider);
     const user = { id: 'oauth-123', email: 'google@user.com', user_metadata: { role: 'customer', name: 'Google User' } };
     const session = { access_token: 'mock-token', user };
     localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
     this._notifyAuthChange('SIGNED_IN', session);
     return { data: { url: window.location.href }, error: null };
  }

  private async _signUp({ email, password, options }: any) {
     console.log('Mock SignUp:', email);
     await new Promise(resolve => setTimeout(resolve, 800));
     
     const role = options?.data?.role || 'customer';
     const name = options?.data?.name || email.split('@')[0];
     
     const user = { 
       id: 'mock-' + Date.now(), 
       email, 
       user_metadata: { role, name } 
     };
     
     const session = { access_token: 'mock-token', user };
     localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
     this._notifyAuthChange('SIGNED_IN', session);
     
     return { data: { user, session }, error: null };
  }

  private async _signInWithOtp({ email }: any) {
    console.log('Mock SignInWithOtp:', email);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { error: null };
  }

  private async _verifyOtp({ email, token }: any) {
    console.log('Mock VerifyOtp:', email, token);
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = { 
       id: 'mock-otp-' + Date.now(), 
       email, 
       user_metadata: { role: 'customer', name: 'User' } 
     };
     const session = { access_token: 'mock-token', user };
     localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
     this._notifyAuthChange('SIGNED_IN', session);
     return { data: { session }, error: null };
  }

  private async _signOut() {
    localStorage.removeItem(STORAGE_KEY);
    this._notifyAuthChange('SIGNED_OUT', null);
    return { error: null };
  }

  private async _getSession() {
    const json = localStorage.getItem(STORAGE_KEY);
    const session = json ? JSON.parse(json) : null;
    return { data: { session }, error: null };
  }

  private async _getUser() {
    const json = localStorage.getItem(STORAGE_KEY);
    const session = json ? JSON.parse(json) : null;
    return { data: { user: session?.user || null }, error: null };
  }

  private async _resetPasswordForEmail(email: string) {
    console.log('Mock Reset Password:', email);
    return { data: {}, error: null };
  }

  private _onAuthStateChange(callback: any) {
    this.authListeners.push(callback);
    this._getSession().then(({ data }) => {
      callback(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
    });
    return { data: { subscription: { unsubscribe: () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    } } } };
  }

  private _notifyAuthChange(event: string, session: any) {
    this.authListeners.forEach(cb => cb(event, session));
  }

  // Public auth object exposing methods bound to this instance
  auth = {
    signInWithPassword: (args: any) => this._signInWithPassword(args),
    signInWithOAuth: (args: any) => this._signInWithOAuth(args),
    signUp: (args: any) => this._signUp(args),
    signInWithOtp: (args: any) => this._signInWithOtp(args),
    verifyOtp: (args: any) => this._verifyOtp(args),
    signOut: () => this._signOut(),
    getSession: () => this._getSession(),
    getUser: () => this._getUser(),
    resetPasswordForEmail: (email: string) => this._resetPasswordForEmail(email),
    onAuthStateChange: (callback: any) => this._onAuthStateChange(callback)
  };

  from(table: string) {
    return new MockQueryBuilder(table);
  }
}

class MockQueryBuilder {
  constructor(private table: string) {}
  
  select(columns?: string) { return this; }
  insert(data: any) { return this; }
  update(data: any) { return this; }
  delete() { return this; }
  eq(col: string, val: any) { return this; }
  neq(col: string, val: any) { return this; }
  gt(col: string, val: any) { return this; }
  lt(col: string, val: any) { return this; }
  gte(col: string, val: any) { return this; }
  lte(col: string, val: any) { return this; }
  in(col: string, val: any) { return this; }
  is(col: string, val: any) { return this; }
  like(col: string, val: any) { return this; }
  ilike(col: string, val: any) { return this; }
  contains(col: string, val: any) { return this; }
  range(from: number, to: number) { return this; }
  single() { return Promise.resolve({ data: {}, error: null }); }
  maybeSingle() { return Promise.resolve({ data: null, error: null }); }
  order() { return this; }
  limit() { return this; }
  
  then(callback: any) {
     return Promise.resolve({ data: [], error: null }).then(callback);
  }
}

export const supabase = new MockSupabaseClient();
