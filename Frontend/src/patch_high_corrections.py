import os, re

def patch(filepath, func):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    new_text = func(text)
    if text != new_text:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_text)

# CORRECTION 1: LandingPage and LoginPage
def fix_landing(t):
    # Remove the whole motion.div
    pattern = r'\s*<motion\.div\s*className="hidden"\s*animate=\{\{[\s\S]*?\}\}\s*transition=\{\{[\s\S]*?\}\}\s*/>'
    return re.sub(pattern, '', t)
patch('Pages/LandingPage.tsx', fix_landing)
patch('Pages/LoginPage.tsx', fix_landing)

# CORRECTION 2: Navbar.tsx
def fix_navbar(t):
    # Change <motion.nav ...> to <nav> and remove initial/animate/transition
    # Since we can just replace the specific lines
    t = t.replace('<motion.nav', '<nav')
    t = t.replace('</motion.nav>', '</nav>')
    t = re.sub(r'\s*initial=\{\{ opacity: 1 \}\}', '', t)
    t = re.sub(r'\s*animate=\{\{ opacity: 1 \}\}', '', t)
    t = re.sub(r'\s*transition=\{\{ duration: 0\.6, ease: "easeOut" \}\}', '', t)
    return t
patch('Components/Navbar.tsx', fix_navbar)

print("Applied HIGH corrections.")
