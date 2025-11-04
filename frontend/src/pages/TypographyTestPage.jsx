import { Box, Container, Typography, Paper } from '@mui/material';

/**
 * TypographyTestPage - Test page to display all MD3 typography variants
 * This page is temporary and used for verifying typography implementation
 * Remove after typography verification is complete
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

      {/* Display Variants */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Display (Large, Expressive Text)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'displayLarge' }}>
            Display Large (57px) - Hero Headlines
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 57px, lineHeight: 1.12, fontWeight: 400
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'displayMedium' }}>
            Display Medium (45px) - Large Section Headers
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 45px, lineHeight: 1.16, fontWeight: 400
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'displaySmall' }}>
            Display Small (36px) - Prominent Page Titles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 36px, lineHeight: 1.22, fontWeight: 400
          </Typography>
        </Box>
      </Paper>

      {/* Headline Variants */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Headline (High-Emphasis Text)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'headlineLarge' }}>
            Headline Large (32px) - Main Page Headings
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 32px, lineHeight: 1.25, fontWeight: 400
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'headlineMedium' }}>
            Headline Medium (28px) - Section Headings
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 28px, lineHeight: 1.29, fontWeight: 400
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'headlineSmall' }}>
            Headline Small (24px) - Subsection Headings
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 24px, lineHeight: 1.33, fontWeight: 400
          </Typography>
        </Box>
      </Paper>

      {/* Title Variants */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Title (Medium-Emphasis Structure)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'titleLarge' }}>
            Title Large (22px) - Toolbar Titles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 22px, lineHeight: 1.27, fontWeight: 400
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'titleMedium' }}>
            Title Medium (16px, Medium Weight) - List Item Titles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 16px, lineHeight: 1.5, fontWeight: 500
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'titleSmall' }}>
            Title Small (14px, Medium Weight) - Overlines
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 14px, lineHeight: 1.43, fontWeight: 500
          </Typography>
        </Box>
      </Paper>

      {/* Body Variants */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Body (Default Reading Text)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'bodyLarge' }}>
            Body Large (16px) - Longer form content, article text. This is the default size for
            comfortable reading of longer passages. It provides excellent readability for extended
            content.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 16px, lineHeight: 1.5, fontWeight: 400
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'bodyMedium' }}>
            Body Medium (14px) - Default body text, descriptions. This is suitable for most UI text,
            card descriptions, and general content throughout the application.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 14px, lineHeight: 1.43, fontWeight: 400
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'bodySmall' }}>
            Body Small (12px) - Captions, helper text, metadata. Use for supplementary information.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 12px, lineHeight: 1.33, fontWeight: 400
          </Typography>
        </Box>
      </Paper>

      {/* Label Variants */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Label (Text on Components)
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'labelLarge' }}>
            Label Large (14px, Medium Weight) - Prominent Buttons
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 14px, lineHeight: 1.43, fontWeight: 500
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'labelMedium' }}>
            Label Medium (12px, Medium Weight) - Standard Buttons
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 12px, lineHeight: 1.33, fontWeight: 500
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ typography: 'labelSmall' }}>
            Label Small (11px, Medium Weight) - Small Buttons
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fontSize: 11px, lineHeight: 1.45, fontWeight: 500
          </Typography>
        </Box>
      </Paper>

      {/* MUI Standard Variants */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          MUI Standard Variants (Backward Compatibility)
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h1">h1 (57px) - Same as displayLarge</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h2">h2 (45px) - Same as displayMedium</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h3">h3 (36px) - Same as displaySmall</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h4">h4 (32px) - Same as headlineLarge</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h5">h5 (28px) - Same as headlineMedium</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6">h6 (24px) - Same as headlineSmall</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1">
            body1 (16px) - Same as bodyLarge. Default paragraph text.
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2">
            body2 (14px) - Same as bodyMedium. Secondary paragraph text.
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="button">button (14px, Medium) - Button text</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption">caption (12px) - Caption text</Typography>
        </Box>
        <Box>
          <Typography variant="overline">overline (11px) - Overline text</Typography>
        </Box>
      </Paper>

      {/* Color Contrast Test */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Color Contrast Test with Palette
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ bgcolor: 'primary.main', p: 2, mb: 1 }}>
            <Typography sx={{ typography: 'bodyLarge', color: 'primary.contrastText' }}>
              Body Large on Primary Background - Should be readable (WCAG AA)
            </Typography>
          </Box>
          <Box sx={{ bgcolor: 'secondary.main', p: 2, mb: 1 }}>
            <Typography sx={{ typography: 'bodyLarge', color: 'secondary.contrastText' }}>
              Body Large on Secondary Background - Should be readable (WCAG AA)
            </Typography>
          </Box>
          <Box sx={{ bgcolor: 'surface.main', p: 2, mb: 1 }}>
            <Typography sx={{ typography: 'bodyLarge', color: 'text.primary' }}>
              Body Large on Surface Background - Should be readable (WCAG AA)
            </Typography>
          </Box>
          <Box sx={{ bgcolor: 'background.paper', p: 2 }}>
            <Typography sx={{ typography: 'bodyLarge', color: 'text.secondary' }}>
              Body Large with Secondary Text on Paper - Should be readable (WCAG AA)
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default TypographyTestPage;
