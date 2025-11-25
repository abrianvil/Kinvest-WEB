const baseFontStack = 'Space Grotesk, Inter, Helvetica, Arial, sans-serif';

export const authAppearance = {
  layout: {
    logoPlacement: 'inside',
    socialButtonsPlacement: 'bottom',
    privacyPageUrl: 'https://clerk.com/legal/privacy',
  },
  variables: {
    colorPrimary: '#C46F3B',
    colorText: '#F3F3F3',
    colorBackground: '#1B1B1B',
    colorAlphaShade: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    fontFamily: baseFontStack,
    fontSize: '16px',
  },
  elements: {
    rootBox: 'min-h-[460px]',
    card: 'bg-[#1B1B1B] border border-[#2A2A2A] shadow-[0_20px_45px_rgba(0,0,0,0.35)]',
    headerTitle: 'text-[28px] font-semibold text-[#F3F3F3]',
    headerSubtitle: 'text-[#C8C8C8]',
    formFieldInput: 'bg-[#121212] border border-[#2A2A2A] text-[#F3F3F3] placeholder:text-[#888888] focus:border-[#00F5A0]',
    formFieldLabel: 'text-xs uppercase tracking-[0.3em] text-[#888888]',
    footerAction__signIn: 'text-[#00F5A0]',
    footerAction__signUp: 'text-[#00F5A0]',
    formButtonPrimary: 'bg-[#C46F3B] text-[#0A0A0A] font-semibold hover:bg-[#A96534]',
    formButtonReset: 'text-[#F3F3F3]',
    socialButtons: 'border border-[#2A2A2A] bg-[#121212]/80 text-[#F3F3F3]',
    dividerLine: 'bg-[#2A2A2A]',
    dividerText: 'text-[#888888]',
    formFieldError: 'text-[#E0C0AA]',
  },
};
