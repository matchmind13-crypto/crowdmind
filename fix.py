with open('/Users/fehercsanad/sporttipp/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = ''.join('#' if ord(c) == 0x25a0 else c for c in content)
with open('/Users/fehercsanad/sporttipp/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Kesz!')
