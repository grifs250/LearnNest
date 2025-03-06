/**
 * Latvian localization for Clerk
 * For all available customization options, see: 
 * https://clerk.com/docs/customization/localization
 */

export const latvianLocalization = {
  locale: "lv-LV",
  
  // Email Verification
  emailVerifications: {
    verificationEmailSubject: "Verificējiet savu e-pastu",
    verificationEmailSentTitle: "E-pasts nosūtīts",
    verificationEmailSentMessage: "Verifikācijas e-pasts tika nosūtīts uz %{identifier}.",
    emailVerificationSentTitle: "E-pasts nosūtīts",
    emailVerificationSentMessage: "Verifikācijas e-pasts tika nosūtīts uz %{email}.",
    emailVerificationRequiredMessage: "Jums ir jāverificē e-pasta adrese, lai turpinātu.",
    emailVerificationExpiredTitle: "Verifikācijas saite ir beigusies",
    emailVerificationExpiredMessage: "Jūsu verifikācijas kods ir beidzies.",
    emailVerificationErrorTitle: "Kaut kas nogāja greizi",
    emailVerificationErrorMessage: "Neizdevās verificēt jūsu e-pastu. Lūdzu, mēģiniet vēlreiz.",
    emailVerificationSuccessTitle: "E-pasts verificēts",
    emailVerificationSuccessMessage: "Jūsu e-pasts tika veiksmīgi verificēts.",
    verificationCodeTitle: "Ievadiet verifikācijas kodu",
    verificationCodeLabel: "Kods",
    verificationCodeInstructionsMessage: "Mēs nosūtījām verifikācijas kodu uz %{email}. Lūdzu, ievadiet to zemāk.",
    verification6CodeFormTitle: "Verificēt e-pastu",
    verification6CodeSubtitle: "Ievadiet 6 ciparu kodu, kas tika nosūtīts uz e-pastu %{email}",
    verification6CodeInputLabel: "Verifikācijas kods",
    verification6CodeInputPlaceholder: "000000",
    verificationButtonLabelSubmit: "Verificēt",
    verificationCodeResendButton: "Nosūtīt kodu vēlreiz",
    verificationCodeResendButtonAriaLabel: "Noklikšķiniet, lai nosūtītu kodu vēlreiz",
    verificationCodeExpiredLabelResend: "Kods ir beidzies. Nosūtīt vēlreiz?",
  },
  
  // General UI elements
  formFieldLabel__emailAddress: "E-pasta adrese",
  formFieldLabel__username: "Lietotājvārds",
  formFieldLabel__password: "Parole",
  formFieldLabel__confirmPassword: "Apstiprināt paroli",
  signUp: {
    start: {
      title: "Reģistrēties",
      subtitle: "Izveidot jaunu kontu",
      actionText: "Jau ir konts?",
      actionLink: "Pieslēgties",
    },
  },
  signIn: {
    start: {
      title: "Pieslēgties",
      subtitle: "Pieslēgties savam kontam",
      actionText: "Nav konta?",
      actionLink: "Reģistrēties",
    },
  },
  userProfile: {
    title: "Profils",
    formButtonPrimary__save: "Saglabāt",
    formButtonPrimary__continue: "Turpināt",
    signOutLink: "Iziet no konta",
  },
  
  // Buttons and form fields
  formButtonPrimary: "Turpināt",
  formButtonReset: "Atcelt",
  backButton: "Atpakaļ",
  continueButton: "Turpināt",
  submitButton: "Iesniegt",
}; 