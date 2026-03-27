import {
  Html, Body, Head, Preview,
  Heading, Text, Button, Hr, Container, Section
} from '@react-email/components';

interface VerificationEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerificationEmail({ name, verifyUrl }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email for AI Coach</Preview>
      <Body style={{ backgroundColor: '#020408', fontFamily: 'system-ui, sans-serif', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#1a1b23', borderRadius: '16px', padding: '40px', maxWidth: '480px', margin: '0 auto' }}>
          <Heading style={{ color: '#dddfff', fontSize: '24px', textAlign: 'center' as const, marginBottom: '16px' }}>
            Welcome to AI Coach, {name}!
          </Heading>
          <Text style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '24px', textAlign: 'center' as const }}>
            Thanks for signing up. Please verify your email address to get the most out of your interview practice.
          </Text>
          <Section style={{ textAlign: 'center' as const, marginTop: '24px', marginBottom: '24px' }}>
            <Button
              href={verifyUrl}
              style={{
                backgroundColor: '#cac5fe',
                color: '#020408',
                padding: '12px 24px',
                borderRadius: '9999px',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Verify Email Address
            </Button>
          </Section>
          <Text style={{ color: '#71717a', fontSize: '12px', textAlign: 'center' as const }}>
            This link expires in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
          </Text>
          <Hr style={{ borderColor: '#27282f', marginTop: '32px' }} />
          <Text style={{ color: '#52525b', fontSize: '11px', textAlign: 'center' as const }}>
            AI Coach — Practice Job Interviews with AI
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
