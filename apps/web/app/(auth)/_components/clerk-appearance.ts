// Clerk exposes `Appearance` via the main package's deep export.
// Use a structural type here so we don't need @clerk/types as a direct dep.
type Appearance = Record<string, unknown>;

/**
 * Brand-matched appearance overrides for Clerk's <SignIn /> / <SignUp />.
 * Keeps the form feeling native to the editorial dark theme — black surfaces,
 * #FF9100 primary, Google Sans typography, mono accents on helper text.
 * Applied per-component (not just via ClerkProvider) because component-level
 * `elements` overrides win over the global variable theme.
 */
export const authAppearance: Appearance = {
  variables: {
    colorPrimary: '#FF9100',
    colorBackground: '#0A0A0A',
    colorInputBackground: '#000000',
    colorInputText: '#F5F5F5',
    colorText: '#F5F5F5',
    colorTextSecondary: '#8A8A8A',
    colorTextOnPrimaryBackground: '#000000',
    colorNeutral: '#F5F5F5',
    colorDanger: '#EF4444',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    borderRadius: '0.75rem',
    fontFamily: '"Google Sans Text", system-ui, sans-serif',
    fontFamilyButtons: '"Google Sans Display", system-ui, sans-serif',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-transparent shadow-none border-0 p-0 w-full',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',

    // Social buttons — outline style on dark surface
    socialButtonsBlockButton:
      'bg-brand-surface border border-brand-border hover:border-brand-primary/40 hover:bg-brand-elevated transition-colors rounded-lg text-brand-text font-medium',
    socialButtonsBlockButtonText: 'font-medium text-brand-text',
    socialButtonsProviderIcon: 'brightness-110',

    // Divider
    dividerRow: 'my-6',
    dividerLine: 'bg-brand-border',
    dividerText: 'text-brand-muted font-mono text-[10px] uppercase tracking-editorial-wide',

    // Inputs
    formFieldLabel: 'text-brand-muted text-xs uppercase tracking-wider font-medium mb-1.5',
    formFieldInput:
      'bg-brand-bg border border-brand-border text-brand-text rounded-lg px-3.5 py-2.5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/40 transition-colors placeholder:text-brand-muted/60',
    formFieldInputShowPasswordButton: 'text-brand-muted hover:text-brand-text transition-colors',
    formFieldHintText: 'text-brand-muted text-xs',
    formFieldErrorText: 'text-brand-danger text-xs font-mono',
    formFieldSuccessText: 'text-brand-success text-xs font-mono',
    formFieldAction: 'text-brand-primary hover:text-brand-accent transition-colors text-xs',
    formFieldWarningText: 'text-brand-warning text-xs font-mono',

    // Primary button
    formButtonPrimary:
      'bg-brand-primary hover:bg-brand-primary-400 text-black font-semibold shadow-glow hover:shadow-glow-lg transition-all rounded-lg py-2.5 normal-case tracking-normal',
    formButtonReset: 'text-brand-muted hover:text-brand-text transition-colors text-sm',

    // Secondary / reset links
    footerActionText: 'text-brand-muted text-sm',
    footerActionLink:
      'text-brand-primary hover:text-brand-accent font-medium transition-colors link-underline',
    footer: 'bg-transparent border-0 text-center mt-4',
    footerPages: 'hidden',

    // Identity preview + back buttons
    identityPreview: 'bg-brand-surface border border-brand-border rounded-lg',
    identityPreviewText: 'text-brand-text',
    identityPreviewEditButton: 'text-brand-primary hover:text-brand-accent',

    // OTP codes
    otpCodeFieldInput:
      'bg-brand-bg border border-brand-border text-brand-text rounded-lg focus:border-brand-primary font-mono',

    // Form header (page title inside Clerk component)
    headerBackRow: 'mb-3',
    headerBackLink:
      'text-brand-muted hover:text-brand-text font-mono text-[10px] uppercase tracking-editorial-wide',

    // Alert boxes
    alert: 'bg-brand-danger/10 border border-brand-danger/30 text-brand-danger rounded-lg text-sm',
    alertText: 'text-brand-danger',

    // User-preview inside flows
    userPreviewMainIdentifier: 'text-brand-text',
    userPreviewSecondaryIdentifier: 'text-brand-muted font-mono',
  },
  layout: {
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
    logoPlacement: 'none',
    helpPageUrl: undefined,
    termsPageUrl: undefined,
    privacyPageUrl: undefined,
  },
};
