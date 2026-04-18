#!/bin/bash
# Usage: ./switch-domain.sh <new-domain>
# Example: ./switch-domain.sh desertgardenguide.com
#          ./switch-domain.sh desertgardenguide-com-766717.hostingersite.com

NEW="$1"
if [ -z "$NEW" ]; then
  echo "Usage: ./switch-domain.sh <domain>"
  echo "Example: ./switch-domain.sh desertgardenguide.com"
  exit 1
fi

CURRENT=$(grep -o 'https://[^/]*' sitemap.xml | head -1 | sed 's|https://||')

if [ -z "$CURRENT" ]; then
  echo "Could not detect current domain from sitemap.xml"
  exit 1
fi

echo "Switching $CURRENT → $NEW ..."

find . -type f \( -name "*.html" -o -name "*.xml" -o -name "*.txt" \) \
  -not -path "./.git/*" \
  -exec sed -i "s|https://$CURRENT|https://$NEW|g" {} +

echo "Done. Run: git add . && git commit -m \"Switch domain to $NEW\" && git push origin main"
