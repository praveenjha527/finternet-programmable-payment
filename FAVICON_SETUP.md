# Favicon Setup

This document explains how the favicon is set up for the Finternet documentation.

## Files

- **Source**: `Favicon-New.svg` - The SVG favicon source file
- **Generated**: `_book/gitbook/images/favicon.svg` - The favicon used in the built documentation

## Setup Process

The favicon setup is automated through a script that runs after the documentation is built.

### Automatic Setup

1. **Build the documentation**:
   ```bash
   honkit build
   ```

2. **Run the favicon setup script**:
   ```bash
   ./setup-favicon.sh
   ```

This script will:
- Copy the SVG favicon to `_book/gitbook/images/favicon.svg`
- Update all HTML files to include the SVG favicon link
- Keep the ICO favicon as a fallback for older browsers

### Manual Setup

If you prefer to set up the favicon manually:

1. **Copy the favicon**:
   ```bash
   mkdir -p _book/gitbook/images
   cp Favicon-New.svg _book/gitbook/images/favicon.svg
   ```

2. **Update HTML files**: Add the following line before the existing favicon.ico link in each HTML file:
   ```html
   <link rel="icon" href="gitbook/images/favicon.svg" type="image/svg+xml">
   ```
   
   Note: Adjust the path based on the file's location:
   - Root files: `gitbook/images/favicon.svg`
   - One level deep: `../gitbook/images/favicon.svg`
   - Two levels deep: `../../gitbook/images/favicon.svg`

## Browser Support

- **Modern browsers** (Chrome, Firefox, Safari, Edge): Will use the SVG favicon
- **Older browsers**: Will fall back to the ICO favicon

## Favicon Details

- **Format**: SVG (Scalable Vector Graphics)
- **Size**: 144x145 pixels (viewBox)
- **Colors**: 
  - Background: #324DBF (Finternet blue)
  - Icon: White (#FFFFFF)

## Notes

- The favicon is automatically included in all generated HTML pages
- The SVG format provides crisp display at any size
- The ICO format is kept as a fallback for maximum compatibility
