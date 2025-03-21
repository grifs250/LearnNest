import fs from 'fs';
import path from 'path';

/**
 * Configuration for custom email templates in Clerk
 */

// Read email verification template
const verificationEmailTemplate = fs.readFileSync(
  path.join(process.cwd(), 'lib/clerk/emails/verification.html'),
  'utf8'
);

// Read password reset template
const resetPasswordEmailTemplate = fs.readFileSync(
  path.join(process.cwd(), 'lib/clerk/emails/reset-password.html'),
  'utf8'
);

// Configuration object for Clerk email templates
export const clerkEmailTemplates = {
  // Verification email template
  verification: {
    emailAddressVerification: {
      subject: "Verificējiet savu e-pasta adresi | MāciesTe",
      htmlTemplate: verificationEmailTemplate,
    },
    resetPassword: {
      subject: "Atjaunojiet savu paroli | MāciesTe",
      htmlTemplate: resetPasswordEmailTemplate,
    },
    inviteOrganizationMember: {
      subject: "Jūs esat uzaicināts pievienoties MāciesTe",
      // Can be expanded with a custom template later
    },
  }
};

/**
 * Helper function to set up Clerk email templates
 * This should be called during app initialization
 */
export const setupClerkEmailTemplates = async () => {
  // This is where we would actually set up the templates with Clerk
  // In a real implementation, we would use Clerk's API to register these templates
  // Example (pseudocode):
  // await clerk.emailTemplates.setup(clerkEmailTemplates);
  
  console.log('Custom email templates are ready to be configured in Clerk dashboard');
  
  // For now, this is a placeholder as templates are set in the Clerk dashboard
  return clerkEmailTemplates;
}; 