from pathlib import Path

html_files = list(Path('..').rglob('*.html'))
missing = []
bad = []
for path in html_files:
    text = path.read_text(encoding='utf-8')
    if 'GTM-NJ5BRWCL' not in text:
        missing.append(str(path))
    else:
        head_count = text.count('<!-- Google Tag Manager -->')
        body_count = text.count('<!-- Google Tag Manager (noscript) -->')
        if head_count != 1 or body_count != 1:
            bad.append((str(path), head_count, body_count))

print(f'checked {len(html_files)} files')
print(f'missing {len(missing)}')
if missing:
    print('\n'.join(missing[:20]))
print(f'bad {len(bad)}')
for item in bad[:20]:
    print(item)
