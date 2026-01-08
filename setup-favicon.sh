#!/bin/bash

# Script to set up favicon in generated HTML files
# Run this after building the documentation with: honkit build

echo "Setting up favicon in HTML files..."

# Ensure the images directory exists
mkdir -p _book/gitbook/images

# Copy the favicon SVG to the images directory
if [ -f "Favicon-New.svg" ]; then
  cp "Favicon-New.svg" "_book/gitbook/images/favicon.svg"
  echo "✓ Copied favicon.svg to _book/gitbook/images/"
else
  echo "⚠ Warning: Favicon-New.svg not found in root directory"
fi

# Find all HTML files and update favicon references
find _book -name "*.html" -type f | while read file; do
  # Get the relative path depth to determine the correct path to gitbook/images
  depth=$(echo "$file" | sed 's|[^/]||g' | wc -c)
  depth=$((depth - 2))  # Subtract 2 for _book/ and the file itself
  
  # Build the relative path
  if [ "$depth" -eq 0 ]; then
    # Root level file
    rel_path="gitbook/images"
  else
    # Subdirectory file
    rel_path=$(printf '../%.0s' $(seq 1 $depth))"gitbook/images"
  fi
  
  # Update the favicon link if it exists
  if grep -q "shortcut icon.*favicon.ico" "$file"; then
    # Check if SVG favicon link already exists
    if ! grep -q "favicon.svg" "$file"; then
      # Add SVG favicon before the ICO favicon
      sed -i.bak "s|<link rel=\"shortcut icon\" href=\"\(.*\)favicon.ico\"|<link rel=\"icon\" href=\"\1favicon.svg\" type=\"image/svg+xml\">\n    <link rel=\"shortcut icon\" href=\"\1favicon.ico\"|g" "$file"
      rm -f "$file.bak"
      echo "Updated: $file"
    fi
  fi
done

echo "Favicon setup complete!"
