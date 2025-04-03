// JWT debugging utilities for Clerk and Supabase integration

/**
 * Decode a JWT token without verification (for debugging only)
 */
export function decodeJwt(token: string): { 
  header: Record<string, any>; 
  payload: Record<string, any>;
} | null {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format - expected 3 parts separated by dots');
      return null;
    }

    // Decode each part
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    return { header, payload };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Log the contents of a JWT token (for debugging only)
 */
export function logJwtContents(token: string): void {
  const decoded = decodeJwt(token);
  if (!decoded) {
    console.error('❌ Could not decode JWT token');
    return;
  }

  console.log('==== JWT TOKEN DEBUG INFO ====');
  console.log('Header:', JSON.stringify(decoded.header, null, 2));
  console.log('Payload:', JSON.stringify(decoded.payload, null, 2));
  
  // Check for common issues
  const { payload, header } = decoded;

  console.log('\n==== JWT VALIDATION CHECKS ====');
  
  // Check algorithm
  console.log(`✓ Algorithm: ${header.alg}`);
  
  // Check issuer
  if (payload.iss) {
    console.log(`✓ Issuer: ${payload.iss}`);
  } else {
    console.log('❌ Missing issuer (iss) claim');
  }
  
  // Check subject
  if (payload.sub) {
    console.log(`✓ Subject: ${payload.sub}`);
  } else {
    console.log('❌ Missing subject (sub) claim');
  }
  
  // Check audience
  if (payload.aud) {
    console.log(`✓ Audience: ${payload.aud}`);
  } else {
    console.log('❌ Missing audience (aud) claim');
  }
  
  // Check expiration
  if (payload.exp) {
    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = expirationDate <= now;
    
    if (isExpired) {
      console.log(`❌ Token expired at ${expirationDate.toISOString()}`);
    } else {
      console.log(`✓ Expires at: ${expirationDate.toISOString()}`);
    }
  } else {
    console.log('❌ Missing expiration (exp) claim');
  }
  
  // Check role for Supabase
  if (payload.role) {
    console.log(`✓ Role: ${payload.role}`);
  } else {
    console.log('❌ Missing role claim (needed for Supabase RLS)');
  }
  
  console.log('================================');
}

/**
 * Validate Supabase specific claims in a JWT
 */
export function validateClaimsForSupabase(token: string): {
  isValid: boolean;
  issues: string[];
} {
  const decoded = decodeJwt(token);
  if (!decoded) {
    return { 
      isValid: false, 
      issues: ['Could not decode JWT token'] 
    };
  }
  
  const { payload, header } = decoded;
  const issues: string[] = [];
  
  // Check for Supabase-specific requirements
  if (!payload.aud) {
    issues.push('Missing audience (aud) claim required by Supabase');
  }
  
  if (!payload.sub) {
    issues.push('Missing subject (sub) claim required for user identification');
  }
  
  // Check algorithm (Supabase prefers RS256)
  if (header.alg !== 'RS256') {
    issues.push(`Algorithm ${header.alg} may not be supported by Supabase (RS256 recommended)`);
  }
  
  // Check expiration
  if (payload.exp) {
    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    if (expirationDate <= now) {
      issues.push(`Token expired at ${expirationDate.toISOString()}`);
    }
  } else {
    issues.push('Missing expiration (exp) claim');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Get debugging help for Supabase JWT issues
 */
export function getJwtDebugHelp(token: string): string {
  const validation = validateClaimsForSupabase(token);
  
  if (validation.isValid) {
    return "✅ JWT appears to be valid for Supabase integration";
  }
  
  let helpText = "🔧 JWT issues detected:\n\n";
  
  validation.issues.forEach(issue => {
    helpText += `- ${issue}\n`;
  });
  
  helpText += "\n🔍 Troubleshooting steps:\n\n";
  
  // Add common troubleshooting steps
  helpText += "1. Verify that you've set up the Clerk JWT template for Supabase correctly\n";
  helpText += "2. Check that the JWKS URL is configured in Supabase\n";
  helpText += "3. Ensure your RLS policies are using the correct JWT claims\n";
  helpText += "4. Check for any clock drift between services\n";
  
  return helpText;
} 