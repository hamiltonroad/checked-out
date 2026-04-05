import { Container, Typography } from '@mui/material';
import TypographyVariantSection from './TypographyVariantSection';
import MuiStandardVariants from './MuiStandardVariants';
import ColorContrastTest from './ColorContrastTest';

const DISPLAY_VARIANTS = [
  {
    typography: 'displayLarge',
    label: 'Display Large (57px) - Hero Headlines',
    details: 'fontSize: 57px, lineHeight: 1.12, fontWeight: 400',
  },
  {
    typography: 'displayMedium',
    label: 'Display Medium (45px) - Large Section Headers',
    details: 'fontSize: 45px, lineHeight: 1.16, fontWeight: 400',
  },
  {
    typography: 'displaySmall',
    label: 'Display Small (36px) - Prominent Page Titles',
    details: 'fontSize: 36px, lineHeight: 1.22, fontWeight: 400',
  },
];

const HEADLINE_VARIANTS = [
  {
    typography: 'headlineLarge',
    label: 'Headline Large (32px) - Main Page Headings',
    details: 'fontSize: 32px, lineHeight: 1.25, fontWeight: 400',
  },
  {
    typography: 'headlineMedium',
    label: 'Headline Medium (28px) - Section Headings',
    details: 'fontSize: 28px, lineHeight: 1.29, fontWeight: 400',
  },
  {
    typography: 'headlineSmall',
    label: 'Headline Small (24px) - Subsection Headings',
    details: 'fontSize: 24px, lineHeight: 1.33, fontWeight: 400',
  },
];

const TITLE_VARIANTS = [
  {
    typography: 'titleLarge',
    label: 'Title Large (22px) - Toolbar Titles',
    details: 'fontSize: 22px, lineHeight: 1.27, fontWeight: 400',
  },
  {
    typography: 'titleMedium',
    label: 'Title Medium (16px, Medium Weight) - List Item Titles',
    details: 'fontSize: 16px, lineHeight: 1.5, fontWeight: 500',
  },
  {
    typography: 'titleSmall',
    label: 'Title Small (14px, Medium Weight) - Overlines',
    details: 'fontSize: 14px, lineHeight: 1.43, fontWeight: 500',
  },
];

const BODY_VARIANTS = [
  {
    typography: 'bodyLarge',
    label:
      'Body Large (16px) - Longer form content, article text. This is the default size for comfortable reading of longer passages. It provides excellent readability for extended content.',
    details: 'fontSize: 16px, lineHeight: 1.5, fontWeight: 400',
  },
  {
    typography: 'bodyMedium',
    label:
      'Body Medium (14px) - Default body text, descriptions. This is suitable for most UI text, card descriptions, and general content throughout the application.',
    details: 'fontSize: 14px, lineHeight: 1.43, fontWeight: 400',
  },
  {
    typography: 'bodySmall',
    label:
      'Body Small (12px) - Captions, helper text, metadata. Use for supplementary information.',
    details: 'fontSize: 12px, lineHeight: 1.33, fontWeight: 400',
  },
];

const LABEL_VARIANTS = [
  {
    typography: 'labelLarge',
    label: 'Label Large (14px, Medium Weight) - Prominent Buttons',
    details: 'fontSize: 14px, lineHeight: 1.43, fontWeight: 500',
  },
  {
    typography: 'labelMedium',
    label: 'Label Medium (12px, Medium Weight) - Standard Buttons',
    details: 'fontSize: 12px, lineHeight: 1.33, fontWeight: 500',
  },
  {
    typography: 'labelSmall',
    label: 'Label Small (11px, Medium Weight) - Small Buttons',
    details: 'fontSize: 11px, lineHeight: 1.45, fontWeight: 500',
  },
];

/**
 * TypographyTestPage - Test page displaying all Material Design 3 typography variants
 *
 * Displays all 15 MD3 type roles and MUI standard variants for visual verification.
 * This is a temporary component used during development and should be removed after
 * typography system verification is complete.
 */
function TypographyTestPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Material Design 3 Typography Test
      </Typography>
      <Typography variant="body1" paragraph>
        This page displays all 15 MD3 type roles and MUI variants for verification.
      </Typography>

      <TypographyVariantSection
        title="Display (Large, Expressive Text)"
        variants={DISPLAY_VARIANTS}
      />
      <TypographyVariantSection
        title="Headline (High-Emphasis Text)"
        variants={HEADLINE_VARIANTS}
      />
      <TypographyVariantSection
        title="Title (Medium-Emphasis Structure)"
        variants={TITLE_VARIANTS}
      />
      <TypographyVariantSection title="Body (Default Reading Text)" variants={BODY_VARIANTS} />
      <TypographyVariantSection title="Label (Text on Components)" variants={LABEL_VARIANTS} />
      <MuiStandardVariants />
      <ColorContrastTest />
    </Container>
  );
}

TypographyTestPage.propTypes = {};

export default TypographyTestPage;
