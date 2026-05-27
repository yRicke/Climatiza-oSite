from pathlib import Path
import re

gtm_head = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NJ5BRWCL');</script>
<!-- End Google Tag Manager -->"""

gtm_body = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id=GTM-NJ5BRWCL\"
height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->"""

html_files = list(Path('..').rglob('*.html'))
updated = []
for path in html_files:
    text = path.read_text(encoding='utf-8')
    if 'GTM-NJ5BRWCL' in text:
        continue
    new_text = text
    head_match = re.search(r'<head\b[^>]*>', text, flags=re.IGNORECASE)
    body_match = re.search(r'<body\b[^>]*>', text, flags=re.IGNORECASE)
    if head_match:
        insert_pos = head_match.end()
        new_text = new_text[:insert_pos] + '\n' + gtm_head + new_text[insert_pos:]
    if body_match:
        insert_pos = body_match.end()
        new_text = new_text[:insert_pos] + '\n' + gtm_body + new_text[insert_pos:]
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        updated.append(str(path))
print(f'Updated {len(updated)} files')
for p in updated:
    print(p)
